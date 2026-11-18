import test from 'node:test';
import assert from 'node:assert/strict';
import {findTwins} from '../src/twins-engine.js';
import {contractRows,contractCenter,contractProfile} from '../src/components/contract-center.js';
import {openWarehouse,readSnapshot} from '../data-pipeline/src/warehouse.mjs';
import {renderTeamTrend,renderTeamGames} from '../src/nba360-team-views.js';
import {dataHealth} from '../src/components/data-health.js';
import {trendSeries,trendValue,trendWorkspace} from '../src/components/player-trends.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const item=(value,unit='')=>({value,unit,source:'https://example.org/fixture',verifiedAt:'2026-11-16'});
const players=[{nbaPlayerId:1,name:'Anchor',team:'HOU',position:'G',jersey:'1'},{nbaPlayerId:2,name:'Similar',team:'HOU',position:'G',jersey:'2'},{nbaPlayerId:3,name:'Different',team:'BOS',position:'F',jersey:'3'}];
const season=(points,role)=>({metrics:{games:item(30),points:item(points),rebounds:item(5),assists:item(7),minutes:item(32),tsPct:item(.6),usage:item(.28)},roles:[{label:role,source:'https://example.org/fixture',verifiedAt:'2026-11-16'}]});
const record=(id,points,role,birth,height,weight,wing)=>({birthDate:item(birth),physical:{height:item(height,'in'),weight:item(weight,'lb'),wingspan:item(wing,'in')},seasons:{'2026-27':season(points,role)}});
const data={players:{1:record(1,20,'creator','1998-01-01',76,200,80),2:record(2,21,'creator','1998-04-01',77,205,81),3:record(3,8,'rim protector','1992-01-01',83,250,87)},contracts:{1:{'2026-27':{cap:20_000_000,contractType:'standard',source:'https://example.org/fixture',verifiedAt:'2026-11-16'}},2:{'2026-27':{cap:21_000_000,contractType:'standard',source:'https://example.org/fixture',verifiedAt:'2026-11-16'}},3:{'2026-27':{cap:40_000_000,contractType:'standard',source:'https://example.org/fixture',verifiedAt:'2026-11-16'}}}};
test('each of seven twin modes invokes sourced strategy and ranks a close candidate',()=>{
 for(const mode of ['very-close','close','statistical','physical','age','contract','scheme']){
  const result=findTwins(players[0],players,data,'2026-27',{mode,limit:3});
  assert.equal(result.status,'ok',mode);assert.equal(result.matches[0].player.nbaPlayerId,2,mode);
  assert.ok(result.matches[0].differences.length>0,mode);
 }
 const missing=structuredClone(data);delete missing.players[1].physical.wingspan;delete missing.players[3].physical.wingspan;
 assert.equal(findTwins(players[0],players,missing,'2026-27',{mode:'physical'}).status,'insufficient_data');
});
test('contract center filters sourced amounts and keeps missing values pending',()=>{
 const sources={contracts:{1:{'2026-27':{cap:20_000_000,source:'https://example.org/fixture',verifiedAt:'2026-11-16',cashPaid:19_000_000,contractType:'standard'}}}};
 assert.equal(contractRows(players,sources,{query:'',team:'all',season:'2026-27',minimum:'',maximum:'',option:'all'}).length,3);
 assert.deepEqual(contractRows(players,sources,{query:'',team:'all',season:'2026-27',minimum:'10000000',maximum:'',option:'all'}).map(row=>row.player.nbaPlayerId),[1]);
 assert.match(contractCenter(players,[{abbr:'HOU',name:'Houston Rockets'},{abbr:'BOS',name:'Boston Celtics'}],sources),/Contract Center/);
 assert.match(contractProfile(players[0],'2026-27',sources),/Tax salary/);
 assert.match(contractProfile(players[1],'2026-27',sources),/No verified player contract/);
});
test('warehouse exposes partial authorized contracts without inventing tax or AAV',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-contract-repair-')),filename=path.join(dir,'test.sqlite3');const db=openWarehouse(filename);
 try{
  db.prepare('INSERT INTO atlas_contract_years VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(1,'HOU','2026-27','standard','2026-07-01',1000000,null,900000,500000,10000,null,'team','2027-06-30',0,'Bird',null,null,null,'https://example.org/fixture','2026-11-16','authorized fixture');
  const item=readSnapshot(db).players.contracts[1]['2026-27'];
  assert.equal(item.cap,null);assert.equal(item.cash,900000);assert.equal(item.tax,null);assert.equal(item.aav,null);assert.equal(item.optionType,'team');
 }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
test('sourced team result opens a detail record without inventing possessions',()=>{
 const game={date:'2026-11-07',opponent:'PHX',home:false,result:'L',points:99,opponentPoints:102,pointDiff:-3,rebounds:46,assists:20,source:'https://example.org/fixture',verifiedAt:'2026-11-16'};
 const snapshot={teamSeasons:{HOU:{wins:1,losses:1,games:2,offRatingEstimated:110,defRatingEstimated:112,netRatingEstimated:-2,source:game.source,verifiedAt:game.verifiedAt}},teamGames:{HOU:[game]}};
 assert.match(renderTeamTrend(snapshot,'HOU',8).chart,/data-team-game="2026-11-07"/);
 const view=renderTeamGames(snapshot,'HOU','2026-11-07');
 assert.match(view.table,/46 team rebounds/);assert.match(view.table,/Player box scores and possession events are not connected/);
});
test('data health labels empty source domains as absent records',()=>{
 const html=dataHealth({sources:1,playerMetricValues:10,players:2,teamGames:0,playerGameLogs:0,shotEvents:0,possessions:0,contractYears:0,bdlGames:0,sourceSnapshots:[]});
 assert.match(html,/Shot events/);assert.match(html,/0 records/);assert.match(html,/Local SQLite is a development database/);
});
test('five-pool coverage reports actual NBA identities without counting missing pools',()=>{
 const html=dataHealth({sources:1,playerMetricValues:10,players:2,teamGames:0,playerGameLogs:0,shotEvents:0,possessions:0,contractYears:0,bdlGames:0,sourceSnapshots:[]},[{team:'HOU',imageStatus:'official_image_found'},{team:'BOS',imageStatus:'missing_or_placeholder'}]);
 assert.match(html,/2 teams · 2 roster identities/);assert.match(html,/1 image URLs found/);
 assert.match(html,/0 \/ 100 ranked prospects/);assert.match(html,/EuroLeague/);assert.match(html,/NBA G League/);
});
test('dated game trends filter authorized logs and compute percentages from attempts',()=>{
 const logs=[
  {gameId:'1',date:'2026-11-01',seasonType:'Regular Season',opponent:'BOS',fieldGoalsMade:2,fieldGoalAttempts:4,points:10,source:'https://example.org/fixture',verifiedAt:'2026-11-16'},
  {gameId:'2',date:'2026-11-03',seasonType:'Regular Season',opponent:'NYK',fieldGoalsMade:0,fieldGoalAttempts:0,points:20,source:'https://example.org/fixture',verifiedAt:'2026-11-16'},
  {gameId:'3',date:'2026-11-05',seasonType:'Playoffs',opponent:'BOS',fieldGoalsMade:3,fieldGoalAttempts:6,points:30,source:'https://example.org/fixture',verifiedAt:'2026-11-16'}
 ];
 assert.equal(trendValue(logs[1],'fgPct'),null);
 const filtered=trendSeries({gameLogs:logs},'points',5,{seasonType:'Regular Season',opponent:'BOS'});
 assert.equal(filtered.selected.length,1);assert.equal(filtered.average,10);
 const percentages=trendSeries({gameLogs:logs},'fgPct',5);
 assert.equal(percentages.selected.length,2);assert.equal(percentages.average,.5);
 assert.match(trendWorkspace({gameLogs:logs},{trendMetric:'points',trendWindow:5,season:'2026-27'}),/recent half/);
});
