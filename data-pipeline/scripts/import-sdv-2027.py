"""Admit a validated local SportsDataverse 2027 MBB snapshot to Atlas SQLite.

Raw downloads and exports stay in .atlas-private; this importer never fetches or
publishes ESPN-origin data. The season group file, not roster presence, defines D1.
"""
import argparse
import csv
import hashlib
import json
import math
import sqlite3
import uuid
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = ROOT / '.atlas-private' / 'sdv-2027'
DEFAULT_DB = ROOT / 'data-pipeline' / 'data' / 'atlas-crystal.sqlite3'
SEASON = '2026-27'
PROVIDER = 'sdv_espn'
BASE = 'https://github.com/sportsdataverse/sportsdataverse-data/releases/download/'
FILES = {
    'rosters_2027.csv': BASE + 'espn_mens_college_basketball_rosters/rosters_2027.csv',
    'player_season_stats_2027.csv': BASE + 'espn_mens_college_basketball_player_season_stats/player_season_stats_2027.csv',
    'mbb_player_crosswalk_2027.csv': BASE + 'mbb_crosswalk/mbb_player_crosswalk_2027.csv',
    'mbb_team_group_seasons_2027.csv': BASE + 'mbb_groups/mbb_team_group_seasons_2027.csv',
    'mbb_group_seasons.csv': BASE + 'mbb_groups/mbb_group_seasons.csv',
}
NAMESPACE = uuid.UUID('ecb71981-4d7b-4246-8abd-0916692e2eb3')


def read_csv(path):
    with path.open(encoding='utf-8-sig', newline='') as handle:
        yield from csv.DictReader(handle)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def person_id(espn_id):
    return str(uuid.uuid5(NAMESPACE, f'ESPN_MBB:{espn_id}'))


def prepare(source):
    paths = {name: source / name for name in FILES}
    missing = [name for name, path in paths.items() if not path.is_file() or not path.stat().st_size]
    if missing:
        raise ValueError(f'Missing or empty files: {missing}')
    hashes = {name: sha256(path) for name, path in paths.items()}
    groups = list(read_csv(paths['mbb_team_group_seasons_2027.csv']))
    d1 = {row['team_id']: row for row in groups if row['season'] == '2027' and row['league'] == 'mbb' and row['team_id_source'] == 'espn' and row['subdivision_id'] == 'mbb:d1'}
    if len(d1) != 365 or len(groups) != 365:
        raise ValueError(f'Expected 365 distinct 2027 D1 ESPN team IDs, found {len(d1)}')
    names = {(row['group_id'], row['season']): row['name'] for row in read_csv(paths['mbb_group_seasons.csv'])}
    roster = [row for row in read_csv(paths['rosters_2027.csv']) if row['team_id'] in d1 and row['season'] == '2027']
    ids = [row['athlete_id'] for row in roster]
    if len(roster) < 5000 or len(set(ids)) != len(ids) or len({row['team_id'] for row in roster}) != 365 or any(not row['athlete_id'] or not row['full_name'] for row in roster):
        raise ValueError('D1 roster failed count, uniqueness, school coverage, or required identity checks')
    roster_by_id = {row['athlete_id']: row for row in roster}
    crosswalk = [row for row in read_csv(paths['mbb_player_crosswalk_2027.csv']) if row['season'] == '2027' and row['espn_team_id'] in d1 and row['espn_athlete_id'] in roster_by_id]
    metrics = {}
    for row in read_csv(paths['player_season_stats_2027.csv']):
        if row['season'] != '2027' or row['athlete_id'] not in roster_by_id or row['team_id'] != roster_by_id[row['athlete_id']]['team_id']:
            continue
        try:
            value = float(row['value'])
        except (ValueError, TypeError):
            continue
        if not math.isfinite(value):
            continue
        code = f"{row['category']}.{row['stat_name']}"
        if not row['stat_name'] or not row['stat_display_name']:
            continue
        key = (row['athlete_id'], code)
        if key in metrics and metrics[key]['value'] != row['value']:
            raise ValueError(f'Conflicting statistic {key}')
        metrics[key] = row
    if len(metrics) < 100000:
        raise ValueError(f'Only {len(metrics)} numeric statistics; refusing sparse replacement')
    return paths, hashes, d1, names, roster, crosswalk, metrics


def import_snapshot(source=DEFAULT_SOURCE, database=DEFAULT_DB):
    paths, hashes, d1, names, roster, crosswalk, metrics = prepare(source)
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    database.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(database, timeout=30)
    try:
        con.executescript((ROOT / 'data-pipeline/schemas/atlas_extension.sql').read_text(encoding='utf-8'))
        old = con.execute("SELECT source_sha256 FROM atlas_foundation_sources WHERE source_key='sdv_2027_rosters'").fetchone()
        if old and old[0] == hashes['rosters_2027.csv']:
            old_stats = con.execute("SELECT source_sha256 FROM atlas_foundation_sources WHERE source_key='sdv_2027_stats'").fetchone()
            old_groups = con.execute("SELECT source_sha256 FROM atlas_foundation_sources WHERE source_key='sdv_2027_groups'").fetchone()
            old_crosswalk = con.execute("SELECT source_sha256 FROM atlas_foundation_sources WHERE source_key='sdv_2027_crosswalk'").fetchone()
            linked = con.execute("SELECT COUNT(*) FROM atlas_foundation_source_ids WHERE provider='espn_mbb' AND season=?", (SEASON,)).fetchone()[0]
            duke_links = con.execute("SELECT COUNT(*) FROM atlas_foundation_source_ids WHERE provider='goduke' AND season=?", (SEASON,)).fetchone()[0]
            if linked == len(roster) and duke_links == 14 and old_stats and old_stats[0] == hashes['player_season_stats_2027.csv'] and old_groups and old_groups[0] == hashes['mbb_team_group_seasons_2027.csv'] and old_crosswalk and old_crosswalk[0] == hashes['mbb_player_crosswalk_2027.csv']:
                return {'status': 'unchanged', 'teams': 365, 'players': len(roster), 'metrics': len(metrics)}
        run_id = str(uuid.uuid4())
        con.execute('BEGIN IMMEDIATE')
        for table in ('atlas_foundation_metrics', 'atlas_foundation_memberships', 'atlas_foundation_teams'):
            con.execute(f"DELETE FROM {table} WHERE {'provider' if table != 'atlas_foundation_teams' else 'provider'}=? AND season=?", (PROVIDER, SEASON))
        con.execute("DELETE FROM atlas_foundation_source_ids WHERE provider IN ('espn_mbb','ncaa','fox','yahoo','kenpom','goduke') AND (season=? OR link_status=?)", (SEASON, SEASON))
        for team_id, group in d1.items():
            rows = [row for row in roster if row['team_id'] == team_id]
            team_name = rows[0]['team_display_name']
            conference = names.get((group['conference_id'], '2027'))
            con.execute('INSERT INTO atlas_foundation_teams VALUES (?,?,?,?,?,?,?,?,?)', ('NCAA_D1', SEASON, PROVIDER, team_id, team_name, conference, FILES['mbb_team_group_seasons_2027.csv'], hashes['mbb_team_group_seasons_2027.csv'], now))
        for row in roster:
            aid, pid = row['athlete_id'], person_id(row['athlete_id'])
            con.execute('INSERT INTO atlas_foundation_people VALUES (?,?,?,?) ON CONFLICT(atlas_person_id) DO NOTHING', (pid, row['full_name'], now, 'ESPN athlete ID; no name-only merge'))
            con.execute('INSERT INTO atlas_foundation_source_ids VALUES (?,?,?,?,?,?) ON CONFLICT(provider,provider_player_id,season) DO NOTHING', (pid, 'espn_mbb', aid, 'provider_reported', SEASON, FILES['rosters_2027.csv']))
            con.execute('INSERT INTO atlas_foundation_memberships VALUES (?,?,?,?,?,?,?,?,?,?,?)', (pid, 'NCAA_D1', SEASON, PROVIDER, row['team_id'], row['jersey'] or None, row['position_abbreviation'] or None, row['status_name'] or 'listed', FILES['rosters_2027.csv'], hashes['rosters_2027.csv'], now))
        for row in crosswalk:
            pid = person_id(row['espn_athlete_id'])
            for provider, field in [('ncaa', 'ncaa_player_id'), ('fox', 'fox_athlete_id'), ('yahoo', 'yahoo_player_id'), ('kenpom', 'kp_player_id')]:
                value = row[field]
                if not value:
                    continue
                prior = con.execute('SELECT atlas_person_id FROM atlas_foundation_source_ids WHERE provider=? AND provider_player_id=? AND season=?', (provider, value, SEASON)).fetchone()
                if prior and prior[0] != pid:
                    continue
                con.execute('INSERT INTO atlas_foundation_source_ids VALUES (?,?,?,?,?,?) ON CONFLICT(provider,provider_player_id,season) DO NOTHING', (pid, provider, value, 'provider_crosswalk_unverified', SEASON, FILES['mbb_player_crosswalk_2027.csv']))
        duke_espn = {(row['full_name'].casefold(),row['jersey']):row for row in roster if row['team_id']=='150'}
        duke_official_rows = con.execute("SELECT p.provider_player_id,b.full_name,b.jersey_number,p.source_url FROM atlas_external_players p JOIN atlas_external_player_bio b ON b.player_key='NCAA_D1:goduke:'||p.provider_player_id WHERE p.pool='NCAA_D1' AND p.source_provider='goduke' AND p.team_id='duke' AND p.season=?",(SEASON,)).fetchall()
        for official_id,name,jersey,official_url in duke_official_rows:
            match = duke_espn.get((name.casefold(),jersey))
            if match:
                con.execute('INSERT INTO atlas_foundation_source_ids VALUES (?,?,?,?,?,?)', (person_id(match['athlete_id']),'goduke',official_id,'proposed_composite_team_name_jersey',SEASON,official_url))
        for (aid, code), row in metrics.items():
            unit = 'percent' if code.lower().endswith('pct') else ('per_game' if row['category'] == 'averages' else 'count')
            con.execute('INSERT INTO atlas_foundation_metrics VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', (person_id(aid), 'NCAA_D1', SEASON, PROVIDER, row['team_id'], code, float(row['value']), unit, row['stat_description'] or row['stat_display_name'], 'provider_reported', FILES['player_season_stats_2027.csv'], hashes['player_season_stats_2027.csv'], now))
        for name, path in paths.items():
            key = {'rosters_2027.csv': 'sdv_2027_rosters', 'player_season_stats_2027.csv': 'sdv_2027_stats', 'mbb_player_crosswalk_2027.csv': 'sdv_2027_crosswalk', 'mbb_team_group_seasons_2027.csv': 'sdv_2027_groups', 'mbb_group_seasons.csv': 'sdv_2027_group_names'}[name]
            count = {'rosters_2027.csv': len(roster), 'player_season_stats_2027.csv': len(metrics), 'mbb_player_crosswalk_2027.csv': len(crosswalk), 'mbb_team_group_seasons_2027.csv': len(d1), 'mbb_group_seasons.csv': len(names)}[name]
            con.execute('INSERT INTO atlas_foundation_sources VALUES (?,?,?,?,?,?,?) ON CONFLICT(source_key) DO UPDATE SET source_sha256=excluded.source_sha256,fetched_at=excluded.fetched_at,row_count=excluded.row_count', (key, FILES[name], hashes[name], SEASON, now, 'local_internal_ESPN_upstream_rights_review', count))
        duke_provider = sum(row['team_id'] == '150' for row in roster)
        duke_official = con.execute("SELECT official_roster_count FROM atlas_external_teams WHERE pool='NCAA_D1' AND source_provider='goduke' AND provider_team_id='duke' AND season=?", (SEASON,)).fetchone()
        conflicts = {'Duke ESPN': duke_provider, 'Duke official': duke_official[0]} if duke_official and duke_provider != duke_official[0] else {}
        report = {'status': 'imported', 'teams': len(d1), 'players': len(roster), 'metrics': len(metrics), 'crosswalkRows': len(crosswalk), 'rosterConflicts': conflicts}
        con.execute('INSERT INTO atlas_foundation_import_runs VALUES (?,?,?,?,?,?,?,?)', (run_id, now, now, 'passed', len(d1), len(roster), len(metrics), json.dumps(report)))
        con.commit()
        return report
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE)
    parser.add_argument('--database', type=Path, default=DEFAULT_DB)
    args = parser.parse_args()
    print(json.dumps(import_snapshot(args.source, args.database), indent=2))
