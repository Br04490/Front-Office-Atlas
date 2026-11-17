#!/usr/bin/env python3
"""Atlas demo ingestion: free BALLDONTLIE scores, consented CSV imports, SQLite exports.

No NBA.com/Spotrac scrapers. Source access must be authorized separately.
Standard library only; Python 3.10+. Not a commercial data license.
"""
import argparse
import csv
import datetime as dt
import json
import os
from pathlib import Path
import sqlite3
import sys
import urllib.parse
import urllib.request
import urllib.error
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parents[1]
DEFAULT_DB=ROOT/'data'/'atlas_demo.sqlite3'
API_BASE='https://api.balldontlie.io/v1/games'
SCHEMA=(ROOT/'schemas'/'atlas_sqlite.sql').read_text(encoding='utf8')
BOX_HEADERS=['game_key','player_key','team_key','source_provider','source_url','minutes','pts','fgm','fga','fg3m','fg3a','ftm','fta','oreb','dreb','reb','ast','stl','blk','tov','pf','plus_minus','collected_at']
CONTRACT_HEADERS=['player_key','team_key','season','salary_usd','guaranteed_usd','option_type','contract_type','source_provider','source_url','as_of_date','usage_permission']
METRIC_HEADERS=['entity_key','season','metric_code','metric_value','unit','sample_size','method_version','source_provider','source_url','as_of_date','data_status']

def connect(path):
    path=Path(path)
    path.parent.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(path)
    db.row_factory=sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript(SCHEMA)
    return db

def now(): return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')
def safe_int(x): return int(x) if x is not None and x!='' else None

def status_state(g):
    state=(g.get('status_state') or '').lower().strip()
    if state in ('final','scheduled','in_progress','postponed','canceled','delayed','suspended','abandoned'):
        return state
    s=str(g.get('status') or '').strip().lower()
    if s.startswith('final'): return 'final'
    if s in ('postponed','canceled','cancelled'): return 'postponed' if s=='postponed' else 'canceled'
    if s.endswith('qtr') or 'halftime' in s: return 'in_progress'
    return 'unknown'

def team_record(db,t):
    if not t or t.get('id') is None: return None
    key=f"bdl:{t['id']}"
    db.execute('''INSERT INTO teams (team_key, source_provider, external_id, abbreviation, full_name, conference, division, last_seen)
    VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(team_key) DO UPDATE SET
    abbreviation=excluded.abbreviation, full_name=excluded.full_name,
    conference=excluded.conference, division=excluded.division, last_seen=excluded.last_seen''',
    (key,'bdl',str(t['id']),t.get('abbreviation'),t.get('full_name'),t.get('conference'),t.get('division'),now()))
    return key

def upsert_games(db,games,source='bdl'):
    added=0; changed_to_final=[]
    for g in games:
        if not isinstance(g,dict) or g.get('id') is None: continue
        key=f'{source}:{g["id"]}'
        home=team_record(db,g.get('home_team') or {})
        away=team_record(db,g.get('visitor_team') or {})
        state=status_state(g)
        old=db.execute('SELECT status_state FROM games WHERE game_key=?',(key,)).fetchone()
        if old is None: added+=1
        if state=='final' and (old is None or old['status_state']!='final'):
            changed_to_final.append(key)
        db.execute('''INSERT INTO games(game_key,source_provider,external_id,game_date,season_start_year,season_type,
        status_state,status_text,home_team_key,away_team_key,home_score,away_score,tipoff_utc,source_url,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_key) DO UPDATE SET
        game_date=excluded.game_date,season_start_year=excluded.season_start_year,
        status_state=excluded.status_state,status_text=excluded.status_text,
        home_team_key=excluded.home_team_key,away_team_key=excluded.away_team_key,
        home_score=excluded.home_score,away_score=excluded.away_score,
        tipoff_utc=excluded.tipoff_utc,updated_at=excluded.updated_at''',
        (key,source,str(g['id']),g.get('date'),safe_int(g.get('season')),
        'playoffs' if g.get('postseason') else 'regular_or_other',state,str(g.get('status','')),
        home,away,safe_int(g.get('home_team_score')),safe_int(g.get('visitor_team_score')),
        g.get('datetime'),f'https://www.balldontlie.io/',now()))
    db.commit()
    return {'ingested':len(games),'new_game_records':added,'newly_final_games':changed_to_final}


def upsert_players(db,items):
    n=0
    for x in items:
        if not isinstance(x,dict) or x.get('id') is None: continue
        team=x.get('team') or {}
        team_key=team_record(db,team) if team else ('bdl:'+str(x['team_id']) if x.get('team_id') is not None else None)
        db.execute('''INSERT INTO players(player_key,source_provider,external_id,first_name,last_name,position,height,
        weight,jersey_number,college,country,draft_year,draft_round,draft_number,provider_team_key,roster_status,last_seen)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(player_key) DO UPDATE SET
        first_name=excluded.first_name,last_name=excluded.last_name,position=excluded.position,height=excluded.height,
        weight=excluded.weight,jersey_number=excluded.jersey_number,college=excluded.college,country=excluded.country,
        draft_year=excluded.draft_year,draft_round=excluded.draft_round,draft_number=excluded.draft_number,
        provider_team_key=excluded.provider_team_key,last_seen=excluded.last_seen''',
        (f"bdl:{x['id']}",'bdl',str(x['id']),x.get('first_name'),x.get('last_name'),x.get('position'),
        x.get('height'),x.get('weight'),x.get('jersey_number'),x.get('college'),x.get('country'),
        safe_int(x.get('draft_year')),safe_int(x.get('draft_round')),safe_int(x.get('draft_number')),
        team_key,'unverified',now()))
        n+=1
    db.commit()
    return {'player_records_upserted':n,'roster_status':'unverified; free tier does not confirm active players'}

def sync_bdl_teams(db,key,fixture=None):
    if not key and not fixture: raise RuntimeError('Set BDL_API_KEY')
    parsed=json.loads(Path(fixture).read_text(encoding='utf8')) if fixture else fetch_json('https://api.balldontlie.io/v1/teams',key)
    items=parsed.get('data',[]) if isinstance(parsed,dict) else parsed
    for team in items: team_record(db,team)
    db.commit()
    return {'teams_upserted':len(items)}

def sync_bdl_players(db,key,team_id,fixture=None):
    if not key and not fixture: raise RuntimeError('Set BDL_API_KEY')
    params=urllib.parse.urlencode({'per_page':100,'team_ids[]':int(team_id)})
    parsed=json.loads(Path(fixture).read_text(encoding='utf8')) if fixture else fetch_json('https://api.balldontlie.io/v1/players?'+params,key)
    items=parsed.get('data',[]) if isinstance(parsed,dict) else parsed
    result=upsert_players(db,items)
    result['next_cursor']=parsed.get('meta',{}).get('next_cursor') if isinstance(parsed,dict) else None
    result['warning']='Only first page imported, and BDL free tier does not verify active roster. Do not present as complete.'
    return result

def fetch_json(url,api_key):
    request=urllib.request.Request(url,headers={'Authorization':api_key,'Accept':'application/json','User-Agent':'AtlasDemo/0.1 (authorized API client)'})
    try:
        with urllib.request.urlopen(request,timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code==429: raise RuntimeError('Provider rate limit hit. Slow the schedule; do not retry aggressively.') from e
        if e.code in (401,403): raise RuntimeError('API authorization or tier denied. Verify BDL_API_KEY.') from e
        raise

def sync_bdl(db,key,days,fixture=None,dry_run=False):
    if fixture:
        parsed=json.loads(Path(fixture).read_text(encoding='utf8'))
        payload=parsed['data'] if isinstance(parsed,dict) and 'data' in parsed else parsed
        return upsert_games(db,payload)
    if not key and not dry_run: raise RuntimeError('Set BDL_API_KEY. Register your own free account at https://app.balldontlie.io/')
    chicago=dt.datetime.now(ZoneInfo('America/Chicago')).date()
    dates=[(chicago-dt.timedelta(days=d)).isoformat() for d in range(days+1)]
    pairs=[('per_page','100')]+[('dates[]',d) for d in dates]
    url=API_BASE+'?'+urllib.parse.urlencode(pairs)
    if dry_run:
        return {'request':url,'dry_run':True,'note':'Scores only: free tier does NOT include player box scores.'}
    all_games=[]; cursors=set()
    while url:
        response=fetch_json(url,key)
        data=response.get('data',[])
        if not isinstance(data,list): raise ValueError('Unexpected provider payload: data must be a list')
        all_games.extend(data)
        cursor=response.get('meta',{}).get('next_cursor')
        if cursor is None: break
        if str(cursor) in cursors: raise RuntimeError('Repeated pagination cursor')
        cursors.add(str(cursor))
        url=API_BASE+'?'+urllib.parse.urlencode(pairs+[('cursor',str(cursor))])
        if len(cursors)>30: raise RuntimeError('More than 30 pages. Investigate provider response')
    return upsert_games(db,all_games)

def required(row,fields):
    for field in fields:
        if not row.get(field): raise ValueError(f'Missing required field {field}: {row}')

def numeric(row,name):
    if row.get(name) in ('',None): return None
    v=float(row[name])
    if not -1e12 < v < 1e12: raise ValueError(f'Out-of-range: {name}')
    return v

def import_csv(db,path,kind):
    path=Path(path)
    if kind=='boxscores':
        required_fields=['game_key','player_key','team_key','source_provider','source_url']
        cols=['pts','fgm','fga','fg3m','fg3a','ftm','fta','oreb','dreb','reb','ast','stl','blk','tov','pf','plus_minus']
    elif kind=='contracts':
        required_fields=['player_key','team_key','season','source_provider','source_url','as_of_date','usage_permission']
    elif kind=='metrics':
        required_fields=['entity_key','season','metric_code','source_provider','source_url','as_of_date','data_status']
    else: raise ValueError('Unknown import kind')
    n=0
    with path.open(newline='',encoding='utf-8-sig') as f:
        reader=csv.DictReader(f)
        for row in reader:
            if all(not (v or '').strip() for v in row.values()): continue
            required(row,required_fields)
            if kind=='boxscores':
                for key in ('player_key','team_key','game_key'):
                    if ':' not in row[key]: raise ValueError(f'{key} must be namespace:external-id')
                fga=numeric(row,'fga'); fgm=numeric(row,'fgm'); fg3m=numeric(row,'fg3m'); fta=numeric(row,'fta');pts=numeric(row,'pts')
                if all(x is not None for x in (fgm,fga,fg3m)) and (fga<fgm or fg3m>fgm): raise ValueError('Inconsistent FG counts')
                ef=(fgm+0.5*fg3m)/fga if fga and fgm is not None and fg3m is not None else None
                denom=(fga or 0)+0.44*(fta or 0) if fga is not None and fta is not None else 0
                ts=pts/(2*denom) if denom>0 and pts is not None else None
                db.execute('''INSERT INTO player_game_stats(game_key,player_key,team_key,source_provider,source_url,minutes,
                pts,fgm,fga,fg3m,fg3a,ftm,fta,oreb,dreb,reb,ast,stl,blk,tov,pf,plus_minus,efg_pct,ts_pct,collected_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_key,player_key,source_provider) DO UPDATE SET
                team_key=excluded.team_key,source_url=excluded.source_url,minutes=excluded.minutes,
                pts=excluded.pts,fgm=excluded.fgm,fga=excluded.fga,fg3m=excluded.fg3m,fg3a=excluded.fg3a,ftm=excluded.ftm,fta=excluded.fta,
                oreb=excluded.oreb,dreb=excluded.dreb,reb=excluded.reb,ast=excluded.ast,stl=excluded.stl,blk=excluded.blk,
                tov=excluded.tov,pf=excluded.pf,plus_minus=excluded.plus_minus,efg_pct=excluded.efg_pct,ts_pct=excluded.ts_pct,collected_at=excluded.collected_at''',
                (row['game_key'],row['player_key'],row['team_key'],row['source_provider'],row['source_url'],row.get('minutes'),
                *[numeric(row,x) for x in cols],ef,ts,row.get('collected_at') or now()))
            elif kind=='contracts':
                if row['usage_permission'] not in ('confirmed_authorized','private_internal_review'):
                    raise ValueError('Contract row requires explicit permitted usage classification; no automatic Spotrac scraping')
                db.execute('''INSERT INTO contracts(player_key,team_key,season,salary_usd,guaranteed_usd,option_type,contract_type,
                source_provider,source_url,as_of_date,usage_permission) VALUES (?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(player_key,team_key,season,source_provider) DO UPDATE SET
                salary_usd=excluded.salary_usd,guaranteed_usd=excluded.guaranteed_usd,option_type=excluded.option_type,
                contract_type=excluded.contract_type,source_url=excluded.source_url,as_of_date=excluded.as_of_date,
                usage_permission=excluded.usage_permission''',
                (row['player_key'],row['team_key'],row['season'],numeric(row,'salary_usd'),numeric(row,'guaranteed_usd'),
                 row.get('option_type'),row.get('contract_type'),row['source_provider'],row['source_url'],row['as_of_date'],row['usage_permission']))
            else:
                if row['data_status'] not in ('verified','derived','experimental','unavailable'):
                    raise ValueError('data_status must be verified, derived, experimental, or unavailable')
                db.execute('''INSERT INTO metric_values(entity_key,season,metric_code,metric_value,unit,sample_size,method_version,
                source_provider,source_url,as_of_date,data_status) VALUES (?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(entity_key,season,metric_code,source_provider) DO UPDATE SET
                metric_value=excluded.metric_value,unit=excluded.unit,sample_size=excluded.sample_size,
                method_version=excluded.method_version,source_url=excluded.source_url,as_of_date=excluded.as_of_date,
                data_status=excluded.data_status''',
                (row['entity_key'],row['season'],row['metric_code'],numeric(row,'metric_value'),row.get('unit'),
                 safe_int(row.get('sample_size')),row.get('method_version'),row['source_provider'],row['source_url'],
                 row['as_of_date'],row['data_status']))
            n+=1
    db.commit()
    return {'imported_rows':n,'kind':kind}

def export(db,out):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    tables=['teams','players','games','player_game_stats','contracts','metric_values']
    summary={}
    for table in tables:
        c=db.execute(f'SELECT * FROM {table}')
        rows=c.fetchall()
        with (out/(table+'.csv')).open('w',newline='',encoding='utf8') as f:
            writer=csv.writer(f)
            writer.writerow([v[0] for v in c.description])
            writer.writerows(rows)
        summary[table]=len(rows)
    (out/'coverage.json').write_text(json.dumps({'generated_at':now(),'rows':summary,'disclaimer':'Not every advanced metric is populated. Empty means unavailable, never zero.'},indent=2)+'\n',encoding='utf8')
    return summary

def main():
    p=argparse.ArgumentParser(description='Atlas demo source-aware data pipeline')
    p.add_argument('--db',default=str(DEFAULT_DB))
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('init')
    sub.add_parser('sync-bdl-teams')
    pls=sub.add_parser('sync-bdl-players');pls.add_argument('--team-id',type=int,required=True)
    sync=sub.add_parser('sync-bdl');sync.add_argument('--days',type=int,default=1);sync.add_argument('--fixture');sync.add_argument('--dry-run',action='store_true')
    imp=sub.add_parser('import-csv');imp.add_argument('kind',choices=['boxscores','contracts','metrics']);imp.add_argument('path')
    exp=sub.add_parser('export');exp.add_argument('--out',default=str(ROOT/'exports'))
    sub.add_parser('status')
    a=p.parse_args()
    if a.command=='sync-bdl' and a.days<0 or getattr(a,'days',0)>7:
        p.error('--days must be 0 to 7 to limit polling and requests')
    db=connect(a.db)
    try:
        if a.command=='init': result={'created':a.db,'status':'empty database ready; not populated with NBA stats'}
        elif a.command=='sync-bdl': result=sync_bdl(db,os.getenv('BDL_API_KEY'),a.days,a.fixture,a.dry_run)
        elif a.command=='sync-bdl-teams': result=sync_bdl_teams(db,os.getenv('BDL_API_KEY'))
        elif a.command=='sync-bdl-players': result=sync_bdl_players(db,os.getenv('BDL_API_KEY'),a.team_id)
        elif a.command=='import-csv':result=import_csv(db,a.path,a.kind)
        elif a.command=='export':result=export(db,a.out)
        else:result={t:db.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in ('teams','players','games','player_game_stats','contracts','metric_values')}
        print(json.dumps(result,indent=2))
    finally: db.close()

if __name__=='__main__':main()
