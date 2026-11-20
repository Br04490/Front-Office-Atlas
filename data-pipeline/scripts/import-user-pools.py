"""Admit the user's selected boys and overseas identity lists, without claiming provider verification."""
import argparse
import csv
import hashlib
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DB=ROOT/'data-pipeline/data/atlas-crystal.sqlite3'
BASE=ROOT/'.atlas-private/user-pools'
NAMESPACE=uuid.UUID('ecb71981-4d7b-4246-8abd-0916692e2eb3')


def read(path):
    with path.open(encoding='utf-8-sig',newline='') as handle:
        return list(csv.DictReader(handle))


def admit(database=DB,base=BASE):
    definitions=[('GRASSROOTS_BOYS','grassroots_top50 Boys.csv',150,'user_grassroots'),('OVERSEAS_MEN','overseas_top50 Men.csv',50,'user_overseas')]
    prepared=[]
    for league,name,expected,provider in definitions:
        path=base/name
        rows=read(path)
        if league=='GRASSROOTS_BOYS':
            excluded=[row for row in rows if '/girls-basketball/' in row['source_url']]
            rows=[row for row in rows if row not in excluded and row['class_year_or_club'] in {'2027','2028','2029'}]
            if len(excluded)!=50:
                raise ValueError(f'Expected to exclude 50 girls records from mislabeled boys file; found {len(excluded)}')
        if len(rows)!=expected or len({row['player_uid'] for row in rows})!=expected or any(not row['full_name'] or not row['source_url'].startswith('https://') for row in rows):
            raise ValueError(f'{league} selection failed identity, count or source checks')
        prepared.append((league,name,provider,rows,hashlib.sha256(path.read_bytes()).hexdigest()))
    now=datetime.now(timezone.utc).isoformat(timespec='seconds')
    con=sqlite3.connect(database)
    try:
        con.executescript((ROOT/'data-pipeline/schemas/atlas_extension.sql').read_text(encoding='utf-8'))
        con.execute('BEGIN IMMEDIATE')
        for league,name,provider,rows,digest in prepared:
            con.execute('DELETE FROM atlas_foundation_memberships WHERE league=? AND season=? AND provider=?',(league,'2026-27',provider))
            con.execute('DELETE FROM atlas_foundation_teams WHERE league=? AND season=? AND provider=?',(league,'2026-27',provider))
            teams={}
            for row in rows:
                team=row['class_year_or_club']
                team_id=f'class-{team}' if league=='GRASSROOTS_BOYS' else team.lower().replace(' ','-')
                teams[team_id]=(f'Class of {team}' if league=='GRASSROOTS_BOYS' else team,row['source_url'])
                pid=str(uuid.uuid5(NAMESPACE,f'{provider}:{row["player_uid"]}'))
                con.execute('INSERT INTO atlas_foundation_people VALUES (?,?,?,?) ON CONFLICT(atlas_person_id) DO NOTHING',(pid,row['full_name'],now,'User-supplied source UID; provider identity unverified'))
                con.execute('INSERT INTO atlas_foundation_source_ids VALUES (?,?,?,?,?,?) ON CONFLICT(provider,provider_player_id,season) DO UPDATE SET atlas_person_id=excluded.atlas_person_id,link_status=excluded.link_status',(pid,provider,row['player_uid'],'user_supplied_unverified','2026-27',row['source_url']))
                con.execute('INSERT INTO atlas_foundation_memberships VALUES (?,?,?,?,?,?,?,?,?,?,?)',(pid,league,'2026-27',provider,team_id,None,row['position'] or None,'user_selected_unverified',row['source_url'],digest,now))
                con.execute('INSERT INTO atlas_player_photos VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(atlas_person_id,league,season) DO UPDATE SET photo_url=excluded.photo_url,identity_status=excluded.identity_status,usage_permission_status=excluded.usage_permission_status,last_checked=excluded.last_checked',(pid,league,'2026-27',row['player_uid'],row['full_name'],team_id,row['headshot_url'] or None,row['source_url'],'untested_candidate' if row['headshot_url'] else 'missing_url','source_uid_not_confirmed_in_image','permission_review_required' if row['headshot_url'] else 'no_image',now[:10],None,None,None,None,None,None,provider,'User-supplied candidate URL; identity and rights unverified'))
            for team_id,(title,source_url) in teams.items():
                con.execute('INSERT INTO atlas_foundation_teams VALUES (?,?,?,?,?,?,?,?,?)',(league,'2026-27',provider,team_id,title,None,source_url,digest,now))
            con.execute('INSERT INTO atlas_foundation_sources VALUES (?,?,?,?,?,?,?) ON CONFLICT(source_key) DO UPDATE SET source_sha256=excluded.source_sha256,fetched_at=excluded.fetched_at,row_count=excluded.row_count',(provider,str(base/name),digest,'2026-27',now,'user_supplied_local_only_provider_rights_unverified',len(rows)))
        con.commit()
        return {league:len(rows) for league,_,_,rows,_ in prepared}
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--database',type=Path,default=DB)
    parser.add_argument('--base',type=Path,default=BASE)
    args=parser.parse_args()
    print(json.dumps(admit(args.database,args.base),indent=2))
