import fs from 'node:fs';
import path from 'node:path';
import {openWarehouse,importSnapshots,defaultDatabase} from '../src/warehouse.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'src/data',name),'utf8'));
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{
  const summary=importSnapshots(db,read('nba360-local.json'),read('nba360-teams-local.json'));
  console.log(JSON.stringify({database:'local SQLite (Git ignored)',...summary},null,2));
}finally{db.close()}
