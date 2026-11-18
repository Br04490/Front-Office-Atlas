import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openWarehouse,defaultDatabase} from './warehouse.mjs';
import {importPhase1Rosters} from './phase1-roster-import.mjs';

const batchesDir=fileURLToPath(new URL('../verified-batches/',import.meta.url));
export function bootstrapVerifiedRosters(filename=defaultDatabase){
 const db=openWarehouse(filename),results=[];
 try{
  for(const manifestName of fs.readdirSync(batchesDir).filter(name=>name.endsWith('.manifest.json')).sort()){
   const prefix=manifestName.slice(0,-'.manifest.json'.length);
   const manifest=JSON.parse(fs.readFileSync(path.join(batchesDir,manifestName),'utf8'));
   const bytes=fs.readFileSync(path.join(batchesDir,`${prefix}.json`));
   if(createHash('sha256').update(bytes).digest('hex')!==manifest.sourceSha256)throw Error(`Verified roster hash mismatch: ${prefix}`);
   const batch=JSON.parse(bytes.toString('utf8'));
   const current=batch.teams.every(team=>db.prepare('SELECT source_sha256 FROM atlas_external_teams WHERE pool=? AND source_provider=? AND provider_team_id=? AND season=?').get(team.pool,manifest.provider,team.providerTeamId,team.season)?.source_sha256===manifest.sourceSha256);
   if(!current)results.push({batch:prefix,...importPhase1Rosters(db,batch,manifest)});
  }
  return results;
 }finally{db.close()}
}
