"""Export photo evidence and honest coverage from the existing Atlas database."""
import argparse
import importlib.util
import json
import sqlite3
from collections import Counter
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('atlas_export',Path(__file__).with_name('export-foundation.py'))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def run(database=ROOT/'data-pipeline/data/atlas-crystal.sqlite3',out=ROOT/'.atlas-private/foundation-exports'):
    out.mkdir(parents=True,exist_ok=True)
    con=sqlite3.connect(database)
    con.row_factory=sqlite3.Row
    try:
        rows=con.execute('SELECT * FROM atlas_player_photos ORDER BY league,team_id,player_name').fetchall()
        headers=['AtlasPersonID','ProviderPlayerID','PlayerName','League','Team','Season','PhotoURL','ProfileURL','ImageStatus','IdentityStatus','UsagePermissionStatus','LastChecked','HTTPStatus','ContentType','Width','Height','FileSize','ImageSHA256','SourceProvider','Note']
        values=[(r['atlas_person_id'],r['provider_player_id'],r['player_name'],r['league'],r['team_id'],r['season'],r['photo_url'],r['profile_url'],r['image_status'],r['identity_status'],r['usage_permission_status'],r['last_checked'],r['http_status'],r['content_type'],r['width'],r['height'],r['file_size'],r['image_sha256'],r['source_provider'],r['note']) for r in rows]
        result={'Player_Photos':module.export('Player_Photos',headers,values,out)}
        result['Photo_Missing']=module.export('Photo_Missing',headers,[v for v in values if v[8]!='loads_valid_image'],out)
        sources=con.execute('SELECT source_provider,COUNT(*) records,COUNT(DISTINCT photo_url) urls,MIN(last_checked) first_checked,MAX(last_checked) last_checked FROM atlas_player_photos GROUP BY source_provider ORDER BY source_provider').fetchall()
        result['Photo_Source_Manifest']=module.export('Photo_Source_Manifest',['SourceProvider','Records','CandidateURLs','FirstChecked','LastChecked','PermissionBasis'],[(r['source_provider'],r['records'],r['urls'],r['first_checked'],r['last_checked'],'Public CDN URL does not grant Atlas display or redistribution rights') for r in sources],out)
        registry={'NBA':525,'NCAA_D1':con.execute("SELECT COUNT(*) FROM atlas_foundation_memberships WHERE league='NCAA_D1' AND season='2026-27'").fetchone()[0],'G_LEAGUE':con.execute("SELECT COUNT(*) FROM atlas_external_memberships WHERE pool='G_LEAGUE' AND season='2026-27'").fetchone()[0],'GRASSROOTS_BOYS':con.execute("SELECT COUNT(*) FROM atlas_foundation_memberships WHERE league='GRASSROOTS_BOYS' AND season='2026-27'").fetchone()[0],'OVERSEAS_MEN':con.execute("SELECT COUNT(*) FROM atlas_foundation_memberships WHERE league='OVERSEAS_MEN' AND season='2026-27'").fetchone()[0]}
        coverage=[]
        for league,total in registry.items():
            part=[r for r in rows if r['league']==league]
            counts=Counter(r['image_status'] for r in part)
            valid=counts['loads_valid_image']
            missing=counts['missing_url']
            broken=counts['broken_or_blocked']+counts['invalid_content']+counts['placeholder_or_small']+counts['generic_placeholder_suspected']
            ambiguous=sum('unreviewed' in r['identity_status'] or 'ambiguous' in r['identity_status'] for r in part)
            approved=sum(r['usage_permission_status']=='approved' and r['image_status']=='loads_valid_image' for r in part)
            review=sum(r['usage_permission_status']=='permission_review_required' for r in part)
            unverified=counts['rate_limited_unverified']+counts['network_unverified']
            coverage.append((league,total,len(part),valid,broken,missing,unverified,max(0,total-len(part)),ambiguous,approved,review,'RED' if not total or len(part)!=total or not approved else 'YELLOW',date.today().isoformat()))
        result['PHOTO_COVERAGE_REPORT']=module.export('PHOTO_COVERAGE_REPORT',['League','CurrentPlayers','CheckedRecords','ValidImageBytes','BrokenOrPlaceholder','MissingURL','RateLimitedOrNetworkUnverified','Unchecked','IdentityReview','ApprovedDisplay','PermissionReview','Status','CheckedAt'],coverage,out)
        return result
    finally:
        con.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--database',type=Path,default=ROOT/'data-pipeline/data/atlas-crystal.sqlite3')
    parser.add_argument('--out',type=Path,default=ROOT/'.atlas-private/foundation-exports')
    args=parser.parse_args()
    print(json.dumps(run(args.database,args.out),indent=2))
