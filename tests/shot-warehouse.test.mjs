import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse,coverage,readSnapshot} from '../data-pipeline/src/warehouse.mjs';
import {importShotEvents} from '../data-pipeline/src/shot-import.mjs';
import {shotSummary} from '../src/shot-intelligence.js';
const shot={playerId:123,season:'2026-27',gameId:'0022600001',gameEventId:12,date:'2026-11-15',locX:25,locY:120,made:true,shotValue:2,shotDistance:12,source:'https://example.org/shot-export',verifiedAt:'2026-11-16'};
const rights={authorizedForAtlas:true,basis:'Explicit fixture permission',sourceUrl:'https://example.org/shot-export'};
test('shot warehouse preserves canonical event location, outcome and source without duplicates',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-shots-'));const db=openWarehouse(path.join(dir,'test.sqlite3'));
  try{
    importShotEvents(db,{rights,shotEvents:[shot]},[{nbaPlayerId:123}]);
    importShotEvents(db,{rights,shotEvents:[shot]},[{nbaPlayerId:123}]);
    assert.equal(coverage(db).shotEvents,1);
    const saved=readSnapshot(db).players.shotEvents;
    assert.equal(saved[0].locX,25);
    assert.equal(shotSummary(saved).makes,1);
    assert.throws(()=>importShotEvents(db,{rights,shotEvents:[{...shot,locX:300}]},[{nbaPlayerId:123}]),/Invalid or duplicate/);
    assert.throws(()=>importShotEvents(db,{rights:{...rights,authorizedForAtlas:false},shotEvents:[shot]},[{nbaPlayerId:123}]),/rights/);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
