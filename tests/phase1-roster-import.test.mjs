import test from 'node:test';
import assert from 'node:assert/strict';
import {openWarehouse,coverage} from '../data-pipeline/src/warehouse.mjs';
import {importPhase1Rosters} from '../data-pipeline/src/phase1-roster-import.mjs';
const manifest={provider:'fixture',authorizedForAtlas:true,rightsBasis:'Fixture only',verifiedAt:'2026-11-18',sourceUrl:'https://example.org/fixture',sourceSha256:'a'.repeat(64)};
const fixture={teams:[{pool:'NCAA_D1',providerTeamId:'school-a',season:'2026-27',name:'Example College',conference:'Sample League',city:'Example',state:'CA',sourceUrl:'https://example.org/team',rosterUrl:'https://example.org/roster',officialRosterCount:2,headCoach:{name:'Coach Fixture',title:'Head Coach',bioUrl:'https://example.org/coach',sourceUrl:'https://example.org/staff'},players:[{providerPlayerId:'p1',name:'Player Fixture',rosterStatus:'listed',bioUrl:'https://example.org/p1',jersey:'1'}]}]};
test('Phase 1 roster batch is atomic, source-backed and marks incomplete roster',()=>{
 const db=openWarehouse(':memory:');try{
  assert.deepEqual(importPhase1Rosters(db,fixture,manifest),{teams:1,players:1,completeRosters:0});
  assert.equal(db.prepare('SELECT campus_region FROM atlas_external_teams').get().campus_region,'West');
  assert.equal(db.prepare('SELECT roster_completeness FROM atlas_external_teams').get().roster_completeness,'incomplete');
  assert.equal(db.prepare('SELECT coach_name FROM atlas_external_coaches').get().coach_name,'Coach Fixture');
  assert.equal(db.prepare('SELECT photo_status FROM atlas_external_player_bio').get().photo_status,'pending');
  assert.equal(db.prepare('SELECT player_key FROM atlas_external_memberships').get().player_key,'NCAA_D1:fixture:p1');
  assert.deepEqual(coverage(db).phase1.NCAA_D1,{teams:1,conferences:1,regions:1,coaches:1,completeRosters:0,players:1,approvedPhotos:0,playersWithStats:0});
  assert.throws(()=>importPhase1Rosters(db,fixture,{...manifest,sourceSha256:'b'.repeat(64)}),/reconciliation/);
  const corrected={teams:[{...fixture.teams[0],players:[],headCoach:null}]};
  importPhase1Rosters(db,corrected,{...manifest,sourceSha256:'b'.repeat(64),verifiedAt:'2026-11-19',reconcileExisting:true});
  assert.equal(coverage(db).phase1.NCAA_D1.players,0);
  assert.equal(coverage(db).phase1.NCAA_D1.coaches,0);
 }finally{db.close()}
});
test('G League fixture rejects invented affiliate and photo rights claims',()=>{
 const db=openWarehouse(':memory:');try{
  const batch={teams:[{...fixture.teams[0],pool:'G_LEAGUE',conference:'Eastern',state:null,players:[{...fixture.teams[0].players[0],photoUrl:'https://example.org/photo',photoStatus:'approved'}]}]};
  assert.throws(()=>importPhase1Rosters(db,batch,manifest),/photo requires/);
  assert.throws(()=>importPhase1Rosters(db,{teams:[{...batch.teams[0],name:'Mexico City Capitanes',nbaAffiliateAbbr:'HOU',players:[]}]},manifest),/no NBA parent/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_external_teams').get().n,0);
 }finally{db.close()}
});
