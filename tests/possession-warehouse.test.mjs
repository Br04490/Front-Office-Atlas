import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse,coverage,readSnapshot} from '../data-pipeline/src/warehouse.mjs';
import {importPossessions} from '../data-pipeline/src/possession-import.mjs';
import {onOffWorkspace} from '../src/components/onoff-workspace.js';
const source='https://example.org/authorized-pbp',rights={authorizedForAtlas:true,basis:'Explicit fixture permission',sourceUrl:source};
const roster=Array.from({length:11},(_,i)=>({nbaPlayerId:i+1}));
const possessions=Array.from({length:80},(_,index)=>({gameId:'0022600001',possessionId:index+1,season:'2026-27',team:'HOU',side:index%2?'defense':'offense',points:index%4===0?2:0,onCourtPlayerIds:index<40?[1,2,3,4,5]:[6,7,8,9,10],source,verifiedAt:'2026-11-16'}));
test('possession warehouse derives source-linked on/off only after counted on and off samples',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-poss-'));const db=openWarehouse(path.join(dir,'test.sqlite3'));
  try{
    importPossessions(db,{rights,possessions},roster);
    importPossessions(db,{rights,possessions},roster);
    assert.equal(coverage(db).possessions,80);
    const snapshot=readSnapshot(db);
    assert.equal(snapshot.teams.lineups.length,2);
    assert.equal(snapshot.teams.lineups[0].def,20);
    const record=snapshot.players.players[1].seasons['2026-27'];
    assert.equal(record.onOff[0].on.offensivePossessions,20);
    assert.equal(record.onOff[0].off.offensivePossessions,20);
    assert.match(onOffWorkspace(record),/Raw net difference/);
    assert.throws(()=>importPossessions(db,{rights,possessions:[{...possessions[0],onCourtPlayerIds:[1,1,2,3,4]}]},roster),/Invalid or duplicate/);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
