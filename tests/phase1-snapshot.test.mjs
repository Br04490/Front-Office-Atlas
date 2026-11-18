import test from 'node:test';
import assert from 'node:assert/strict';
import {openWarehouse} from '../data-pipeline/src/warehouse.mjs';
import {importPhase1Rosters} from '../data-pipeline/src/phase1-roster-import.mjs';
import {phase1Snapshot} from '../data-pipeline/src/phase1-snapshot.mjs';
test('read-only Phase 1 view joins only admitted roster, coach and approved photos',()=>{
 const db=openWarehouse(':memory:');try{
  const batch={teams:[{pool:'NCAA_D1',providerTeamId:'fixture-school',season:'2026-27',name:'Fixture University',conference:'Fixture Conference',city:'Fixture City',state:'NY',sourceUrl:'https://example.org/team',rosterUrl:'https://example.org/roster',officialRosterCount:1,players:[{providerPlayerId:'fixture-player',name:'Fixture Player',bioUrl:'https://example.org/player',rosterStatus:'listed',photoUrl:'https://example.org/photo'}],headCoach:{name:'Fixture Coach',title:'Head Coach',bioUrl:'https://example.org/coach',sourceUrl:'https://example.org/staff'}}]};
  const manifest={provider:'fixture',authorizedForAtlas:true,rightsBasis:'Fixture only',verifiedAt:'2026-11-18',sourceUrl:'https://example.org/source',sourceSha256:'a'.repeat(64)};
  importPhase1Rosters(db,batch,manifest);
  const snapshot=phase1Snapshot(db);assert.deepEqual(snapshot.coverage,{teams:1,players:1,coaches:1,metrics:0});
  assert.equal(snapshot.teams[0].headCoach.name,'Fixture Coach');assert.equal(snapshot.teams[0].players[0].photoUrl,null);
  assert.equal(snapshot.teams[0].players[0].key,'NCAA_D1:fixture:fixture-player');
 }finally{db.close()}
});
