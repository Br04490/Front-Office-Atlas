import fs from 'node:fs';
import path from 'node:path';
import {openWarehouse,defaultDatabase,coverage} from '../src/warehouse.mjs';
import {importPossessions} from '../src/possession-import.mjs';

const filename=process.argv[2];
if(!filename)throw Error('Usage: node data-pipeline/scripts/import-possessions.mjs <authorized-possessions.json>');
const payload=JSON.parse(fs.readFileSync(filename,'utf8'));
const roster=JSON.parse(fs.readFileSync(path.resolve('src/data/players.json'),'utf8')).players;
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{console.log(JSON.stringify({...importPossessions(db,payload,roster),coverage:coverage(db)},null,2))}finally{db.close()}
