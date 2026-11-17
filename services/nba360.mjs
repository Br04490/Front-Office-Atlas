import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {coverage,defaultDatabase,readSnapshot} from '../data-pipeline/src/warehouse.mjs';

let cache=null;
export function nba360Api(req,res,url){
  if(req.method!=='GET'){res.writeHead(405).end('Method not allowed');return}
  if(!['/api/nba360/snapshot','/api/nba360/coverage'].includes(url.pathname)){res.writeHead(404).end('Not found');return}
  if(!fs.existsSync(defaultDatabase)){res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({status:'unavailable',reason:'Local NBA warehouse has not been imported'}));return}
  try{
    const modified=fs.statSync(defaultDatabase).mtimeMs;
    if(!cache||cache.modified!==modified){
      const db=new DatabaseSync(defaultDatabase,{readOnly:true});
      try{cache={modified,snapshot:readSnapshot(db),coverage:coverage(db)}}finally{db.close()}
    }
    const payload=url.pathname.endsWith('/coverage')?cache.coverage:cache.snapshot;
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, max-age=60'}).end(JSON.stringify(payload));
  }catch(error){res.writeHead(500,{'Content-Type':'application/json'}).end(JSON.stringify({status:'error',reason:'Warehouse read failed'}))}
}
