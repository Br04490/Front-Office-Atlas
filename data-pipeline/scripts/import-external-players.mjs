import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {openWarehouse,defaultDatabase} from '../src/warehouse.mjs';
import {importExternalPlayers} from '../src/external-player-import.mjs';
const [recordsPath,manifestPath]=process.argv.slice(2);
if(!recordsPath||!manifestPath)throw Error('Usage: node data-pipeline/scripts/import-external-players.mjs <authorized-players.json> <rights-manifest.json>');
const bytes=fs.readFileSync(recordsPath);
const rows=JSON.parse(bytes.toString('utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(createHash('sha256').update(bytes).digest('hex')!==manifest.sourceSha256)throw Error('Rights manifest SHA-256 does not match the supplied file');
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{console.log(JSON.stringify(importExternalPlayers(db,rows,manifest),null,2))}finally{db.close()}
