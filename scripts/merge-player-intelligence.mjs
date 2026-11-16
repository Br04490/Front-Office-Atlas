import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mergePlayerIntelligence} from '../src/player-intelligence-merge.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv.find(arg=>!arg.startsWith('--')&&arg!==process.argv[0]&&arg!==process.argv[1]);
const apply=process.argv.includes('--apply');
if(!input)throw Error('Usage: node scripts/merge-player-intelligence.mjs <authorized-export.json> [--apply]');
const destination=path.join(root,'src/data/player-intelligence.json');
const stageDir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-intelligence-'));
try{
 const stage=path.join(stageDir,'validated.json');
 const validation=spawnSync(process.execPath,[path.join(root,'scripts/import-player-intelligence.mjs'),path.resolve(input),stage],{encoding:'utf8'});
 if(validation.status!==0)throw Error(validation.stderr.trim()||validation.stdout.trim()||'Source validation failed');
 const current=JSON.parse(fs.readFileSync(destination,'utf8'));
 const incoming=JSON.parse(fs.readFileSync(stage,'utf8'));
 const merged=mergePlayerIntelligence(current,incoming);
 const before={players:Object.keys(current.players||{}).length,shots:(current.shotEvents||[]).length,contracts:Object.values(current.contracts||{}).reduce((n,seasons)=>n+Object.keys(seasons).length,0)};
 const after={players:Object.keys(merged.players).length,shots:merged.shotEvents.length,contracts:Object.values(merged.contracts).reduce((n,seasons)=>n+Object.keys(seasons).length,0)};
 if(apply){
  const backupDir=path.join(root,'work/data-backups');fs.mkdirSync(backupDir,{recursive:true});
  const backup=path.join(backupDir,`player-intelligence-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.copyFileSync(destination,backup);
  const candidate=path.join(path.dirname(destination),`.player-intelligence-${process.pid}.tmp`);
  try{fs.writeFileSync(candidate,JSON.stringify(merged,null,2)+'\n');fs.renameSync(candidate,destination)}finally{if(fs.existsSync(candidate))fs.rmSync(candidate)}
  console.log(JSON.stringify({status:'applied',before,after,backup}));
 }else console.log(JSON.stringify({status:'dry_run',before,after,source:incoming.rights.sourceUrl}));
}finally{fs.rmSync(stageDir,{recursive:true,force:true})}
