import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {openWarehouse,defaultDatabase} from '../src/warehouse.mjs';
import {importPhase1Rosters} from '../src/phase1-roster-import.mjs';
const [batchPath,manifestPath]=process.argv.slice(2);
if(!batchPath||!manifestPath)throw Error('Usage: node data-pipeline/scripts/import-phase1-rosters.mjs <teams.json> <rights-manifest.json>');
const bytes=fs.readFileSync(batchPath),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(createHash('sha256').update(bytes).digest('hex')!==manifest.sourceSha256)throw Error('Manifest SHA-256 does not match the supplied batch');
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{console.log(JSON.stringify(importPhase1Rosters(db,JSON.parse(bytes.toString('utf8')),manifest),null,2))}finally{db.close()}
