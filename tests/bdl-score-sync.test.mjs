import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse,coverage} from '../data-pipeline/src/warehouse.mjs';
import {pollBdlScores} from '../data-pipeline/src/bdl-score-sync.mjs';

test('BDL score polling is key-gated, idempotent and detects final transitions',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-bdl-'));const db=openWarehouse(path.join(dir,'test.sqlite3'));
  try{
    assert.equal((await pollBdlScores(db)).status,'awaiting_key');
    const game={id:7,date:'2026-11-15',season:2026,status:'3rd Qtr',home_team:{abbreviation:'HOU'},visitor_team:{abbreviation:'DAL'},home_team_score:90,visitor_team_score:85};
    const fetcher=async(url,options)=>{assert.match(url,/dates%5B%5D=/);assert.equal(options.headers.Authorization,'test-key');return {ok:true,json:async()=>({data:[game],meta:{next_cursor:null}})}};
    assert.deepEqual((await pollBdlScores(db,{apiKey:'test-key',fetcher})).newFinalGames,[]);
    assert.equal(coverage(db).bdlGames,1);
    game.status='Final';
    assert.deepEqual((await pollBdlScores(db,{apiKey:'test-key',fetcher})).newFinalGames,[7]);
    assert.deepEqual((await pollBdlScores(db,{apiKey:'test-key',fetcher})).newFinalGames,[]);
    assert.equal(coverage(db).bdlGames,1);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
