import csv
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src'))
import atlas_demo as m

class TestAtlas(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.db=m.connect(Path(self.temp.name)/'test.sqlite3')
 def tearDown(self):
  self.db.close();self.temp.cleanup()
 def test_idempotent_final(self):
  sample=[{"id":100,"date":"2026-11-15","season":2026,"status_state":"final","status":"Final","home_team":{"id":1,"full_name":"Test A"},"visitor_team":{"id":2,"full_name":"Test B"},"home_team_score":121,"visitor_team_score":110}]
  self.assertEqual(m.upsert_games(self.db,sample)['newly_final_games'],['bdl:100'])
  self.assertEqual(m.upsert_games(self.db,sample)['newly_final_games'],[])
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM games').fetchone()[0],1)
 def test_final_transition(self):
  x={"id":100,"date":"2026-11-15","status_state":"scheduled"}
  m.upsert_games(self.db,[x]);x['status_state']='final'
  self.assertEqual(m.upsert_games(self.db,[x])['newly_final_games'],['bdl:100'])
 def test_derived_ts_efg(self):
  path=Path(self.temp.name)/'box.csv'
  row=dict.fromkeys(m.BOX_HEADERS,'');row.update(game_key='licensed:1',player_key='nba:42',team_key='nba:1',source_provider='licensed',source_url='https://example.org',pts='26',fgm='10',fga='20',fg3m='2',fg3a='5',ftm='4',fta='6')
  with path.open('w',newline='') as f:
   w=csv.DictWriter(f,fieldnames=m.BOX_HEADERS);w.writeheader();w.writerow(row)
  m.import_csv(self.db,path,'boxscores')
  r=self.db.execute('SELECT efg_pct,ts_pct FROM player_game_stats').fetchone()
  self.assertAlmostEqual(r['efg_pct'],0.55)
  self.assertAlmostEqual(r['ts_pct'],26/(2*(20+.44*6)))
 def test_contract_permission(self):
  path=Path(self.temp.name)/'c.csv'
  row=dict.fromkeys(m.CONTRACT_HEADERS,'');row.update(player_key='nba:42',team_key='nba:1',season='2026-27',source_provider='spotrac',source_url='https://www.spotrac.com',as_of_date='2026-11-16',usage_permission='unverified')
  with path.open('w',newline='') as f:
   w=csv.DictWriter(f,fieldnames=m.CONTRACT_HEADERS);w.writeheader();w.writerow(row)
  with self.assertRaises(ValueError):m.import_csv(self.db,path,'contracts')
 def test_players_and_team_roster_unverified(self):
  records=[{'id':11,'first_name':'Example','last_name':'Player','position':'G','team':{'id':4,'abbreviation':'TST','full_name':'Test Team'}}]
  result=m.upsert_players(self.db,records)
  self.assertEqual(result['player_records_upserted'],1)
  row=self.db.execute('SELECT player_key,roster_status,provider_team_key FROM players').fetchone()
  self.assertEqual(tuple(row),('bdl:11','unverified','bdl:4'))
 def test_missing_api_key(self):
  with self.assertRaises(RuntimeError):m.sync_bdl(self.db,'',days=0)
 def test_reject_invalid_boxscore(self):
  path=Path(self.temp.name)/'b.csv'
  row=dict.fromkeys(m.BOX_HEADERS,'');row.update(game_key='a:1',player_key='b:2',team_key='c:3',source_provider='x',source_url='https://example.org',fgm='11',fga='10',fg3m='2')
  with path.open('w',newline='') as f:
   w=csv.DictWriter(f,fieldnames=m.BOX_HEADERS);w.writeheader();w.writerow(row)
  with self.assertRaises(ValueError):m.import_csv(self.db,path,'boxscores')
 def test_fixture_and_export(self):
  f=Path(__file__).resolve().parents[1]/'fixtures'/'FAKE_bdl_games.json'
  self.assertEqual(len(m.sync_bdl(self.db,'',1,fixture=f)['newly_final_games']),1)
  result=m.export(self.db,Path(self.temp.name)/'exports')
  self.assertEqual(result['games'],1)
  self.assertTrue((Path(self.temp.name)/'exports'/'coverage.json').exists())

if __name__=='__main__':unittest.main()
