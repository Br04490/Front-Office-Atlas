"""Check ID-bound image candidates without publishing or copying image files."""
import argparse
import csv
import hashlib
import io
import json
import sqlite3
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from datetime import date
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DB = ROOT / 'data-pipeline/data/atlas-crystal.sqlite3'
ROSTER = ROOT / '.atlas-private/sdv-2027/rosters_2027.csv'
SEASON = '2026-27'


def candidates(con):
    nba = json.loads((ROOT / 'src/data/players.json').read_text(encoding='utf-8'))['players']
    for row in nba:
        pid = str(row['nbaPlayerId'])
        yield {'atlas_person_id':f'NBA:{pid}','league':'NBA','provider_player_id':pid,'player_name':row['name'],'team_id':row['team'],'photo_url':row['thumbnailUrl'] if row['imageStatus']=='official_image_found' else None,'profile_url':f'https://www.nba.com/player/{pid}','identity_status':'nba_id_match_uniform_'+row['uniformStatus'],'source_provider':'nba_cdn'}
    source = {}
    with ROSTER.open(encoding='utf-8-sig', newline='') as handle:
        for row in csv.DictReader(handle):
            source[row['athlete_id']] = row
    for row in con.execute("SELECT m.atlas_person_id,s.provider_player_id,p.display_name,m.provider_team_id FROM atlas_foundation_memberships m JOIN atlas_foundation_people p USING(atlas_person_id) JOIN atlas_foundation_source_ids s ON s.atlas_person_id=m.atlas_person_id AND s.provider='espn_mbb' AND s.season=m.season WHERE m.league='NCAA_D1' AND m.season=?", (SEASON,)):
        person, pid, name, team = row
        raw = source.get(pid, {})
        url = raw.get('headshot_href') or None
        # The provider ID embedded in the official roster field is stronger than a name match.
        matched = bool(url and f'/{pid}.' in url)
        yield {'atlas_person_id':person,'league':'NCAA_D1','provider_player_id':pid,'player_name':name,'team_id':team,'photo_url':url if matched else None,'profile_url':raw.get('link_web') or None,'identity_status':'provider_id_url_match_visual_unreviewed' if matched else 'missing_or_ambiguous_url','source_provider':'sdv_espn'}
    for row in con.execute("SELECT atlas_person_id,league,provider_player_id,player_name,team_id,photo_url,profile_url,source_provider FROM atlas_player_photos WHERE league IN ('GRASSROOTS_BOYS','OVERSEAS_MEN') AND season=?",(SEASON,)):
        person,league,pid,name,team,url,profile,provider=row
        yield {'atlas_person_id':person,'league':league,'provider_player_id':pid,'player_name':name,'team_id':team,'photo_url':url,'profile_url':profile,'identity_status':'source_uid_not_confirmed_in_image','source_provider':provider}


def check_image(url, timeout=6):
    for attempt in range(2):
        try:
            request = urllib.request.Request(url, headers={'User-Agent':'FrontOfficeAtlasPhotoAudit/1.0 (local verification)','Accept':'image/*'})
            with urllib.request.urlopen(request, timeout=timeout) as response:
                content_type = response.headers.get('Content-Type','').split(';')[0].lower()
                data = response.read(4_000_001)
                status = response.status
            if not content_type.startswith('image/') or not data or len(data)>4_000_000:
                return ('invalid_content',status,content_type,None,None,len(data),None)
            with Image.open(io.BytesIO(data)) as image:
                image.verify()
            with Image.open(io.BytesIO(data)) as image:
                width,height = image.size
            if width<60 or height<60:
                return ('placeholder_or_small',status,content_type,width,height,len(data),hashlib.sha256(data).hexdigest())
            return ('loads_valid_image',status,content_type,width,height,len(data),hashlib.sha256(data).hexdigest())
        except urllib.error.HTTPError as error:
            if error.code in (429,500,502,503,504) and attempt==0:
                time.sleep(2)
                continue
            return ('rate_limited_unverified' if error.code==429 else 'broken_or_blocked',error.code,None,None,None,None,None)
        except Exception:
            if attempt==0:
                time.sleep(1)
                continue
            return ('network_unverified',None,None,None,None,None,None)


def run(database=DB, limit=None, delay=.18, workers=10):
    con=sqlite3.connect(database,timeout=30)
    try:
        con.executescript((ROOT/'data-pipeline/schemas/atlas_extension.sql').read_text(encoding='utf-8'))
        rows=list(candidates(con))
        done={row[0] for row in con.execute('SELECT atlas_person_id FROM atlas_player_photos WHERE last_checked=? AND image_status IN (\'loads_valid_image\',\'missing_url\')',(date.today().isoformat(),))}
        rows=[row for row in rows if row['atlas_person_id'] not in done]
        if limit is not None:
            rows=rows[:limit]
        today=date.today().isoformat()
        counts=Counter()
        def verify(row):
            url=row['photo_url']
            if url:
                status,http,ctype,width,height,size,digest=check_image(url)
                time.sleep(delay)
            else:
                status,http,ctype,width,height,size,digest=('missing_url',None,None,None,None,None,None)
            return row,status,http,ctype,width,height,size,digest
        with ThreadPoolExecutor(max_workers=workers) as pool:
         for i,(row,status,http,ctype,width,height,size,digest) in enumerate(pool.map(verify,rows),1):
            url=row['photo_url']
            # No CDN URL establishes commercial display rights; never promote automatically.
            permission='permission_review_required' if url else 'no_image'
            con.execute('INSERT INTO atlas_player_photos VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(atlas_person_id,league,season) DO UPDATE SET photo_url=excluded.photo_url,profile_url=excluded.profile_url,image_status=excluded.image_status,identity_status=excluded.identity_status,usage_permission_status=excluded.usage_permission_status,last_checked=excluded.last_checked,http_status=excluded.http_status,content_type=excluded.content_type,width=excluded.width,height=excluded.height,file_size=excluded.file_size,image_sha256=excluded.image_sha256,source_provider=excluded.source_provider,note=excluded.note', (row['atlas_person_id'],row['league'],SEASON,row['provider_player_id'],row['player_name'],row['team_id'],url,row['profile_url'],status,row['identity_status'],permission,today,http,ctype,width,height,size,digest,row['source_provider'],'visual identity and usage rights pending'))
            counts[(row['league'],status)]+=1
            if i%100==0:
                con.commit()
                print(json.dumps({'checked':i,'total':len(rows),'counts':{f'{league}:{status}':n for (league,status),n in counts.items()}}),flush=True)
        con.commit()
        # A repeated hash across unrelated athletes is suspicious even when dimensions pass.
        repeats=con.execute("SELECT image_sha256,COUNT(*) n FROM atlas_player_photos WHERE image_sha256 IS NOT NULL GROUP BY image_sha256 HAVING n>=3").fetchall()
        for digest,n in repeats:
            con.execute("UPDATE atlas_player_photos SET image_status='generic_placeholder_suspected',note=? WHERE image_sha256=?",(f'same image hash for {n} players; manual review required',digest))
        con.commit()
        return {'checked':len(rows),'repeatedImageHashes':len(repeats),'statusByLeague':{f'{league}:{status}':n for (league,status),n in counts.items()}}
    finally:
        con.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--database',type=Path,default=DB)
    parser.add_argument('--limit',type=int)
    parser.add_argument('--delay',type=float,default=.18)
    parser.add_argument('--workers',type=int,default=10)
    args=parser.parse_args()
    print(json.dumps(run(args.database,args.limit,args.delay,args.workers),indent=2))
