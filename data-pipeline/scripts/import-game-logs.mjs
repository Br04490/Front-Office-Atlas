import fs from 'node:fs';
import path from 'node:path';
import {openWarehouse,defaultDatabase,coverage} from '../src/warehouse.mjs';
import {importGameLogs} from '../src/game-log-import.mjs';

const [csvPath,manifestPath]=process.argv.slice(2);
if(!csvPath||!manifestPath)throw Error('Usage: node data-pipeline/scripts/import-game-logs.mjs <licensed.csv> <rights-manifest.json>');
const rights=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const roster=JSON.parse(fs.readFileSync(path.resolve('src/data/players.json'),'utf8')).players;
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{
  const result=importGameLogs(db,fs.readFileSync(csvPath,'utf8'),{...rights,roster});
  console.log(JSON.stringify({...result,coverage:coverage(db)},null,2));
}finally{db.close()}
