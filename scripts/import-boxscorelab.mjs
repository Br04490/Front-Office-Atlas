import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {importSeasonTotals,boxscorelabMetricDefinitions} from '../src/boxscorelab-import.js';
import {mergePlayerIntelligence} from '../src/player-intelligence-merge.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const inputs=process.argv.slice(2);
if(!inputs.length)throw Error('Usage: node scripts/import-boxscorelab.mjs <downloaded-season-totals.csv> [...more seasons]');
const roster=JSON.parse(fs.readFileSync(path.join(root,'src/data/players.json'),'utf8')).players;
const rights={authorizedForAtlas:true,basis:'BoxScore Lab CSV published under CC BY 4.0; local private Atlas snapshot only. NBA-origin downstream publication rights require separate review.',sourceUrl:'https://boxscorelab.com/downloads/',attribution:'BoxScore Lab, boxscorelab.com, data through November 16, 2026'};
let merged={schemaVersion:1,description:'Local BoxScore Lab NBA season-totals snapshot.',players:{},shotEvents:[],contracts:{},metricDefinitions:{},leagueZoneBaselines:{}};
const files=[];
for(const input of inputs){const name=path.basename(input),match=name.match(/^(20\d{2}-\d{2})-player-season-totals\.csv$/);if(!match)throw Error(`Unexpected source filename: ${name}`);const bytes=fs.readFileSync(input),sourceUrl=`https://boxscorelab.com/downloads/${name}`,result=importSeasonTotals(bytes.toString('utf8'),roster,{sourceUrl});if(result.coverage.conflicts.length)throw Error(`Current-team mismatches in ${name}: ${JSON.stringify(result.coverage.conflicts)}`);merged=mergePlayerIntelligence(merged,{schemaVersion:1,rights,players:result.players,shotEvents:[],contracts:{},metricDefinitions:boxscorelabMetricDefinitions,leagueZoneBaselines:{}});files.push({name,sourceUrl,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),...result.coverage})}
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-boxscorelab-'));
const destination=path.join(root,'src/data/nba360-local.json');
try{const stagedInput=path.join(temporary,'staged-input.json'),stagedOutput=path.join(temporary,'validated.json');fs.writeFileSync(stagedInput,JSON.stringify({...merged,rights}));const validation=spawnSync(process.execPath,[path.join(root,'scripts/import-player-intelligence.mjs'),stagedInput,stagedOutput],{encoding:'utf8'});if(validation.status!==0)throw Error(validation.stderr.trim()||validation.stdout.trim());const validated=JSON.parse(fs.readFileSync(stagedOutput,'utf8'));validated.sourceImports=merged.sourceImports;validated.sourceFiles=files.map(({name,sourceUrl,sha256})=>({name,sourceUrl,sha256}));const candidate=`${destination}.${process.pid}.tmp`;try{fs.writeFileSync(candidate,JSON.stringify(validated,null,2)+'\n');if(fs.existsSync(destination)){const backupDir=path.join(root,'work/data-backups');fs.mkdirSync(backupDir,{recursive:true});fs.copyFileSync(destination,path.join(backupDir,`nba360-local-${Date.now()}.json`))}fs.renameSync(candidate,destination)}finally{if(fs.existsSync(candidate))fs.rmSync(candidate)}
const report={generatedAt:new Date().toISOString(),destination:'local ignored NBA overlay',playersWithMetrics:Object.keys(validated.players).length,playerSeasons:Object.values(validated.players).reduce((n,p)=>n+Object.keys(p.seasons).length,0),metricValues:Object.values(validated.players).reduce((n,p)=>n+Object.values(p.seasons).reduce((m,s)=>m+Object.keys(s.metrics).length,0),0),shotEvents:0,contracts:0,files};const auditPath=path.join(root,'work/nba360-source/import-audit.json');fs.mkdirSync(path.dirname(auditPath),{recursive:true});fs.writeFileSync(auditPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({playersWithMetrics:report.playersWithMetrics,playerSeasons:report.playerSeasons,metricValues:report.metricValues,files:files.map(f=>({name:f.name,rows:f.rows,matchedSeasons:f.matchedSeasons,unmatched:f.unmatched.length}))},null,2))}finally{fs.rmSync(temporary,{recursive:true,force:true})}
