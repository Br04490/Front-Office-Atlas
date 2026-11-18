import test from 'node:test';
import assert from 'node:assert/strict';
import {openWarehouse,coverage} from '../data-pipeline/src/warehouse.mjs';
import {importExternalPlayers} from '../data-pipeline/src/external-player-import.mjs';
import {dataHealth} from '../src/components/data-health.js';

const manifest={authorizedForAtlas:true,rightsBasis:'Fixture permission only',sourceUrl:'https://example.org/fixture',verifiedAt:'2026-11-18',sourceSha256:'a'.repeat(64),provider:'fixture'};
const rows=[{pool:'EUROLEAGUE',providerPlayerId:'test-1',playerName:'Example Player',teamId:'test-club',teamName:'Example Club',season:'2026-27',rosterStatus:'verified'}];
test('authorized external identities are idempotent and counted from warehouse',()=>{
 const db=openWarehouse(':memory:');try{
  assert.equal(importExternalPlayers(db,rows,manifest).admitted,1);
  importExternalPlayers(db,rows,manifest);
  const report=coverage(db);assert.deepEqual(report.externalPools.map(row=>({...row})),[{pool:'EUROLEAGUE',players:1,teams:1}]);
  assert.match(dataHealth(report,[]),/1 clubs · 1 players/);
 }finally{db.close()}
});
test('missing rights, invalid top-100 rank and duplicate identities abort import',()=>{
 const db=openWarehouse(':memory:');try{
  assert.throws(()=>importExternalPlayers(db,rows,{...manifest,authorizedForAtlas:false}),/rights basis/);
  assert.throws(()=>importExternalPlayers(db,[{...rows[0],pool:'HIGH_SCHOOL_TOP_100'}],manifest),/rank/);
  assert.throws(()=>importExternalPlayers(db,[rows[0],rows[0]],manifest),/Duplicate/);
  assert.equal(coverage(db).externalPools.length,0);
  importExternalPlayers(db,rows,manifest);
  assert.throws(()=>importExternalPlayers(db,rows,{...manifest,sourceSha256:'b'.repeat(64)}),/Conflicting/);
 }finally{db.close()}
});
