import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {bootstrapVerifiedRosters} from '../data-pipeline/src/bootstrap-verified-rosters.mjs';
import {phase1Snapshot} from '../data-pipeline/src/phase1-snapshot.mjs';

test('verified Duke roster bootstraps once into a fresh warehouse',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-roster-'));
 try{
  const file=path.join(dir,'atlas.sqlite3');
  assert.deepEqual(bootstrapVerifiedRosters(file),[{batch:'ncaa-duke-2026-27',teams:1,players:14,completeRosters:1}]);
  assert.deepEqual(bootstrapVerifiedRosters(file),[]);
  const db=new DatabaseSync(file,{readOnly:true});
  try{
   const snapshot=phase1Snapshot(db);
   assert.equal(snapshot.coverage.players,14);
   assert.equal(snapshot.coverage.coaches,1);
   assert.equal(snapshot.coverage.metrics,0);
   assert.equal(snapshot.teams[0].roster_completeness,'complete');
   assert.equal(snapshot.teams[0].players.filter(player=>player.photoUrl).length,0);
  }finally{db.close()}
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
