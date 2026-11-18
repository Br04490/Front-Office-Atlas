import test from 'node:test';
import assert from 'node:assert/strict';
import {openWarehouse,coverage} from '../data-pipeline/src/warehouse.mjs';
test('additive Phase 1 schema opens without changing NBA coverage',()=>{
 const db=openWarehouse(':memory:');try{
  const names=new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row=>row.name));
  for(const name of ['atlas_external_players','atlas_external_teams','atlas_external_coaches','atlas_external_player_bio','atlas_external_memberships','atlas_external_player_metrics','atlas_external_player_game_logs','atlas_external_identity_links'])assert.ok(names.has(name),name);
  assert.deepEqual(coverage(db).externalPools,[]);
  assert.equal(coverage(db).playerMetricValues,0);
 }finally{db.close()}
});
