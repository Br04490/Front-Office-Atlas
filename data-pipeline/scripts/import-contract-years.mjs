import fs from 'node:fs';
import path from 'node:path';
import {openWarehouse,defaultDatabase,coverage} from '../src/warehouse.mjs';
import {parseCsv} from '../src/game-log-import.mjs';
import {contractColumns,importContractRows} from '../src/contract-import.mjs';

const [csvPath,manifestPath]=process.argv.slice(2);
if(!csvPath||!manifestPath)throw Error('Usage: node data-pipeline/scripts/import-contract-years.mjs <licensed.csv> <rights-manifest.json>');
const rights=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const roster=JSON.parse(fs.readFileSync(path.resolve('src/data/players.json'),'utf8')).players;
const records=parseCsv(fs.readFileSync(csvPath,'utf8'),contractColumns);
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{console.log(JSON.stringify({...importContractRows(db,records,{...rights,roster}),coverage:coverage(db)},null,2))}finally{db.close()}
