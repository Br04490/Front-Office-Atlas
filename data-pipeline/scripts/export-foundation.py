"""Export actual local Atlas records as CSV and single-sheet XLSX files.

Exports are private by default because source publication rights are not settled.
Empty domains receive headers and an explicit RED row in the completeness report.
"""
import argparse
import csv
import json
import sqlite3
import zipfile
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / 'data-pipeline/data/atlas-crystal.sqlite3'
DEFAULT_OUT = ROOT / '.atlas-private/foundation-exports'


def cell(value):
    if value is None:
        return '<c t="inlineStr"><is><t></t></is></c>'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c><v>{value}</v></c>'
    return f'<c t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'


def export(name, headers, rows, out):
    rows = list(rows)
    with (out / f'{name}.csv').open('w', newline='', encoding='utf-8-sig') as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)
    with zipfile.ZipFile(out / f'{name}.xlsx', 'w', compression=zipfile.ZIP_DEFLATED) as book:
        book.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
        book.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        book.writestr('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Atlas Data" sheetId="1" r:id="rId1"/></sheets></workbook>')
        book.writestr('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
        with book.open('xl/worksheets/sheet1.xml', 'w') as sheet:
            sheet.write(b'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>')
            for values in [headers, *rows]:
                sheet.write(('<row>' + ''.join(cell(value) for value in values) + '</row>').encode('utf-8'))
            sheet.write(b'</sheetData></worksheet>')
    return len(rows)


def run(database=DEFAULT_DB, out=DEFAULT_OUT):
    out.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(database)
    con.row_factory = sqlite3.Row
    result = {}
    try:
        def query(sql, args=()):
            return [tuple(row) for row in con.execute(sql, args)]
        nba = json.loads((ROOT / 'src/data/players.json').read_text(encoding='utf-8'))
        result['NBA_2026_27'] = export('NBA_2026_27', ['atlas_person_id','nba_player_id','name','team','team_id','jersey','position','season','roster_source','last_verified'], [(f"NBA:{p['nbaPlayerId']}",p['nbaPlayerId'],p['name'],p['team'],p['teamId'],p['jersey'],p['position'],nba['season'],p['rosterSource'],p['lastVerificationDate']) for p in nba['players']], out)
        result['NCAA_D1_Men_2026_27'] = export('NCAA_D1_Men_2026_27', ['atlas_person_id','espn_athlete_id','name','espn_team_id','team','conference','jersey','position','season','source_status','source_url','updated_at'], query("SELECT m.atlas_person_id,s.provider_player_id,p.display_name,m.provider_team_id,t.display_name,t.conference,m.jersey,m.position,m.season,'provider_reported_official_validation_pending',m.source_url,m.updated_at FROM atlas_foundation_memberships m JOIN atlas_foundation_people p USING(atlas_person_id) JOIN atlas_foundation_source_ids s ON s.atlas_person_id=m.atlas_person_id AND s.provider='espn_mbb' AND s.season=m.season JOIN atlas_foundation_teams t ON t.league=m.league AND t.season=m.season AND t.provider=m.provider AND t.provider_team_id=m.provider_team_id WHERE m.league='NCAA_D1' AND m.season='2026-27' ORDER BY t.display_name,p.display_name"), out)
        result['GLeague_2026_27'] = export('GLeague_2026_27', ['atlas_person_id','name','team','season','source_url'], query("SELECT m.player_key,b.full_name,t.official_name,m.season,m.source_url FROM atlas_external_memberships m JOIN atlas_external_player_bio b ON b.player_key=m.player_key JOIN atlas_external_teams t ON t.pool=m.pool AND t.source_provider=m.source_provider AND t.provider_team_id=m.provider_team_id AND t.season=m.season WHERE m.pool='G_LEAGUE' AND m.season='2026-27'"), out)
        for name,league in [('Grassroots_Boys','GRASSROOTS_BOYS'),('Overseas_Top50','OVERSEAS_MEN')]:
            result[name] = export(name, ['atlas_person_id','name','group_or_club','season','source_status','source_url'], query('SELECT m.atlas_person_id,p.display_name,t.display_name,m.season,m.roster_status,m.source_url FROM atlas_foundation_memberships m JOIN atlas_foundation_people p USING(atlas_person_id) JOIN atlas_foundation_teams t ON t.league=m.league AND t.season=m.season AND t.provider=m.provider AND t.provider_team_id=m.provider_team_id WHERE m.league=? ORDER BY t.display_name,p.display_name',(league,)), out)
        result['Player_ID_Crosswalk'] = export('Player_ID_Crosswalk', ['atlas_person_id','provider','provider_player_id','season','link_status','source_url'], query('SELECT atlas_person_id,provider,provider_player_id,season,link_status,source_url FROM atlas_foundation_source_ids ORDER BY atlas_person_id,provider'), out)
        result['Player_Advanced_Stats'] = export('Player_Advanced_Stats', ['atlas_person_id','league','season','team_id','metric_code','value','unit','definition','method','source_url','updated_at'], query('SELECT atlas_person_id,league,season,provider_team_id,metric_code,metric_value,unit,metric_definition,calculation_method,source_url,updated_at FROM atlas_foundation_metrics ORDER BY atlas_person_id,metric_code'), out)
        result['Team_Stats'] = export('Team_Stats', ['team','season','wins','losses','games','points_per_game','opponent_points_per_game','source_url','verified_at'], query('SELECT team_abbr,season,wins,losses,games,points_per_game,opponent_points_per_game,source_url,verified_at FROM atlas_team_seasons ORDER BY season,team_abbr'), out)
        result['Shot_Events'] = export('Shot_Events', ['nba_player_id','season','game_id','event_id','game_date','x','y','made','shot_value','source_url','verified_at'], query('SELECT nba_player_id,season,game_id,game_event_id,game_date,loc_x,loc_y,made,shot_value,source_url,verified_at FROM atlas_shot_events'), out)
        result['Contracts_Verified'] = export('Contracts_Verified', ['nba_player_id','team','season','base_salary_usd','cap_hit_usd','guaranteed_usd','source_url','verified_at'], query('SELECT nba_player_id,team_abbr,season,base_salary_usd,cap_hit_usd,guaranteed_usd,source_url,verified_at FROM atlas_contract_years'), out)
        result['Metric_Definitions'] = export('Metric_Definitions', ['metric_code','definition','unit','method','source_url'], query("SELECT metric_code,MIN(metric_definition),MIN(unit),MIN(calculation_method),MIN(source_url) FROM atlas_foundation_metrics GROUP BY metric_code ORDER BY metric_code"), out)
        result['Source_Manifest'] = export('Source_Manifest', ['source_key','source_url','sha256','season','fetched_at','rights_status','row_count'], query('SELECT source_key,source_url,source_sha256,season,fetched_at,rights_status,row_count FROM atlas_foundation_sources ORDER BY source_key'), out)
        completeness = []
        for label, expected, actual, note in [('NBA teams',30,30,'dated roster snapshot; revalidation pending'),('NCAA D1 teams',365,365,'SportsDataverse group membership; school verification pending'),('NCAA D1 roster players',None,result['NCAA_D1_Men_2026_27'],'provider-reported; official roster reconciliation pending'),('G League teams',31,0,'authorized current feed needed'),('Grassroots boys',150,result['Grassroots_Boys'],'user-supplied identities; source validation pending'),('Overseas selected',50,result['Overseas_Top50'],'user-supplied identities; current club verification pending'),('Shot events',None,result['Shot_Events'],'authorized events needed'),('Verified contracts',None,result['Contracts_Verified'],'authorized cap records needed')]:
            status = 'YELLOW' if actual else 'RED'
            completeness.append((label,expected if expected is not None else '',actual,'' if expected is None else max(0,expected-actual),status,note,date.today().isoformat()))
        result['DATA_COMPLETENESS_REPORT'] = export('DATA_COMPLETENESS_REPORT', ['component','expected','actual','missing','status','note','checked_at'], completeness, out)
        return result
    finally:
        con.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--database', type=Path, default=DEFAULT_DB)
    parser.add_argument('--out', type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    print(json.dumps(run(args.database,args.out), indent=2))
