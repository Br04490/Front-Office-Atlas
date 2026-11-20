import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {rankTeamDna} from '../services/team-dna.mjs';

test('team DNA keeps one reference population after display filtering and rejects unsupported metrics',()=>{
 const db=new DatabaseSync(':memory:');
 db.exec('CREATE TABLE atlas_player_season_metrics (nba_player_id TEXT,season TEXT,metric_code TEXT,value REAL,unit TEXT,source_url TEXT,verified_at TEXT,sample TEXT)');
 const insert=db.prepare("INSERT INTO atlas_player_season_metrics VALUES (?,'2026-27',?,?,'count','https://example.org/source','2026-11-19','season')");
 for(const [id,value] of [['1628386',10],['1628964',7],['1630596',5]])for(const [code,number] of [['rebounds',value],['games',10],['minutes',25]])insert.run(id,code,number);
 const all=rankTeamDna(db,{metrics:[{code:'rebounds',weight:1,direction:'high'}]});
 const filtered=rankTeamDna(db,{metrics:[{code:'rebounds',weight:1,direction:'high'}],search:'Jarrett'});
 assert.equal(all.referencePopulation,3);
 assert.equal(filtered.referencePopulation,3);
 assert.equal(filtered.results[0].score,all.results.find(row=>row.nbaPlayerId===filtered.results[0].nbaPlayerId).score);
 for(const [id,attempts] of [['1628386',4],['1628964',24],['1630596',30]])for(const [code,value] of [['threePct',.4],['threePointAttempts',attempts]])insert.run(id,code,value);
 const shooting=rankTeamDna(db,{metrics:[{code:'threePct',weight:1,direction:'high'}]});
 assert.equal(shooting.referencePopulation,2);
 assert.ok(shooting.results.every(row=>row.evidence[0].attempts>=20));
 assert.throws(()=>rankTeamDna(db,{metrics:[{code:'madeUp',weight:1,direction:'high'}]}),/invalid/);
 db.close();
});
