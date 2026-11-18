import fs from 'node:fs';
import {openWarehouse,defaultDatabase} from '../src/warehouse.mjs';
import {contractCoverage} from '../src/contract-coverage.mjs';

const season=process.argv[2]||'2026-27';
const roster=JSON.parse(fs.readFileSync('src/data/players.json','utf8')).players;
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{console.log(JSON.stringify(contractCoverage(db,roster,season),null,2))}finally{db.close()}
