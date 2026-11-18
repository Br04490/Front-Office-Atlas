import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {defaultDatabase} from '../data-pipeline/src/warehouse.mjs';
import {phase1Snapshot} from '../data-pipeline/src/phase1-snapshot.mjs';
export function phase1Api(req,res,url){
 if(req.method!=='GET'){res.writeHead(405).end('GET required');return}
 if(url.pathname!=='/api/phase1/snapshot'){res.writeHead(404).end('Not found');return}
 if(!fs.existsSync(defaultDatabase)){res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({status:'unavailable',reason:'Local warehouse missing'}));return}
 try{const db=new DatabaseSync(defaultDatabase,{readOnly:true});let output;try{output=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='atlas_external_teams'").get()?phase1Snapshot(db):{season:'2026-27',teams:[],coverage:{teams:0,players:0,coaches:0,metrics:0}}}finally{db.close()}res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-cache'}).end(JSON.stringify(output))}catch{res.writeHead(500,{'Content-Type':'application/json'}).end(JSON.stringify({status:'error',reason:'Phase 1 warehouse read failed'}))}
}
