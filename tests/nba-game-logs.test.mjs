import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse,coverage,readSnapshot} from '../data-pipeline/src/warehouse.mjs';
import {importGameLogs,gameLogColumns} from '../data-pipeline/src/game-log-import.mjs';
import {trendSeries,trendWorkspace} from '../src/components/player-trends.js';

const roster=[{nbaPlayerId:123,name:'Test Player',team:'HOU'}];
const sourceUrl='https://example.org/authorized-game-log';
const rights={sourceUrl,verifiedAt:'2026-11-16',authorizedForAtlas:true,rightsBasis:'Explicit test-fixture license',roster};
const row={nba_player_id:'123',game_id:'0022600001',game_date:'2026-11-15',season:'2026-27',team:'HOU',opponent:'DAL',season_type:'Regular Season',minutes:'30',points:'22',rebounds:'8',assists:'5',fgm:'8',fga:'16',three_made:'2',three_attempts:'6',ftm:'4',fta:'5',turnovers:'1',steals:'2',blocks:'0'};
const csv=value=>`${gameLogColumns.join(',')}\n${gameLogColumns.map(key=>value[key]??'').join(',')}\n`;
test('authorized game log import is idempotent and feeds exact trend bars',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-logs-'));const db=openWarehouse(path.join(dir,'data.sqlite3'));
  try{
    importGameLogs(db,csv(row),rights);importGameLogs(db,csv(row),rights);
    assert.equal(coverage(db).playerGameLogs,1);
    const record=readSnapshot(db).players.players[123].seasons['2026-27'];
    assert.equal(record.gameLogs[0].points,22);
    assert.equal(trendSeries(record,'points',8).average,22);
    assert.match(trendWorkspace(record,{trendMetric:'points',trendWindow:8,season:'2026-27'}),/2026-11-15/);
    assert.throws(()=>importGameLogs(db,csv({...row,points:'23'}),rights),/Inconsistent box score/);
    assert.equal(coverage(db).playerGameLogs,1);
    assert.throws(()=>importGameLogs(db,csv(row),{...rights,authorizedForAtlas:false}),/Authorized HTTPS/);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
test('missing game logs show dependency without invented bars',()=>{
  const html=trendWorkspace({metrics:{points:{value:22}}},{trendMetric:'points',trendWindow:8,season:'2026-27'});
  assert.match(html,/game logs unavailable/);
  assert.doesNotMatch(html,/22\.0/);
});
