import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse} from '../data-pipeline/src/warehouse.mjs';
import {foundationApi} from '../services/foundation.mjs';

test('foundation search combines sourced identity, team, position and metric thresholds',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-foundation-')),file=path.join(dir,'warehouse.sqlite3');
 try{
  const db=openWarehouse(file);
  db.prepare('INSERT INTO atlas_foundation_people VALUES (?,?,?,?)').run('person-1','Sample Guard','2026-11-19','ESPN ID');
  db.prepare('INSERT INTO atlas_foundation_source_ids VALUES (?,?,?,?,?,?)').run('person-1','espn_mbb','9001','provider_reported','2026-27','https://example.org/roster');
  db.prepare('INSERT INTO atlas_foundation_teams VALUES (?,?,?,?,?,?,?,?,?)').run('NCAA_D1','2026-27','sdv_espn','150','Sample School','ACC','https://example.org/groups','a'.repeat(64),'2026-11-19');
  db.prepare('INSERT INTO atlas_foundation_memberships VALUES (?,?,?,?,?,?,?,?,?,?,?)').run('person-1','NCAA_D1','2026-27','sdv_espn','150','1','G','Active','https://example.org/roster','a'.repeat(64),'2026-11-19');
  for(const [code,value] of [['totals.points',20],['totals.assists',8]])db.prepare('INSERT INTO atlas_foundation_metrics VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run('person-1','NCAA_D1','2026-27','sdv_espn','150',code,value,'count',code,'provider_reported','https://example.org/stats','a'.repeat(64),'2026-11-19');
  db.close();
  const query=search=>{let status,body;foundationApi({method:'GET'},{writeHead(code){status=code;return this},end(value){body=JSON.parse(value)}},new URL(`http://localhost/api/foundation/players?${search}`),file);return {status,body}};
  const match=query('q=Guard&team=150&position=G&sourceId=9001&filter=totals.points%7Cgte%7C20&filter=totals.assists%7Cgte%7C8');
  assert.equal(match.status,200);assert.equal(match.body.total,1);assert.equal(match.body.rows[0].atlas_person_id,'person-1');
  assert.equal(query('filter=totals.points%7Cgte%7C21').body.total,0);
  assert.equal(query('filter=totals.points%7Cbad%7C20').status,400);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
