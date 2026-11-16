import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const script=path.resolve('scripts/import-player-intelligence.mjs');
const player=JSON.parse(fs.readFileSync('src/data/players.json','utf8')).players[0];
const rights={authorizedForAtlas:true,basis:'test fixture permission',sourceUrl:'https://example.com/licensed-export',attribution:'Example licensed source'};
const shot={playerId:player.nbaPlayerId,gameId:'0022600001',gameEventId:1,date:'2026-11-01',season:'2026-27',locX:20,locY:80,made:true,shotValue:2,source:'https://example.com/shot/1',verifiedAt:'2026-11-15'};
function run(payload){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-intelligence-'));const input=path.join(dir,'input.json'),output=path.join(dir,'output.json');fs.writeFileSync(input,JSON.stringify(payload));const result=spawnSync(process.execPath,[script,input,output],{encoding:'utf8'});const data=fs.existsSync(output)?JSON.parse(fs.readFileSync(output,'utf8')):null;fs.rmSync(dir,{recursive:true,force:true});return {result,data}}
test('authorized shot import preserves NBA player ID, event and provenance',()=>{const {result,data}=run({schemaVersion:1,rights,players:{},shotEvents:[shot]});assert.equal(result.status,0,result.stderr);assert.equal(data.shotEvents.length,1);assert.equal(data.shotEvents[0].playerId,player.nbaPlayerId);assert.equal(data.rights.attribution,rights.attribution)});
test('import refuses missing rights, impossible coordinates and duplicate events',()=>{assert.notEqual(run({schemaVersion:1,players:{},shotEvents:[shot]}).result.status,0);assert.notEqual(run({schemaVersion:1,rights,players:{},shotEvents:[{...shot,locY:500}]}).result.status,0);assert.notEqual(run({schemaVersion:1,rights,players:{},shotEvents:[shot,shot]}).result.status,0)});
