import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRows,ringPositions} from '../src/sandbox-scope.js';
import {rankPlayers} from '../src/components/statistical-sandbox.js';
const team={abbr:'ATL'},season='2026-27', players=Array.from({length:7},(_,i)=>({nbaPlayerId:i+1,team:i<5?'ATL':'UTA'}));
const source='https://example.org/fixture',verifiedAt='2026-11-20';
const intel={contracts:{6:{[season]:{expirationYear:2027,optionType:'team',source,verifiedAt}},7:{[season]:{cap:50,source,verifiedAt}}}};
const query=(scope,ids,props={},phase={},lineups=[])=>buildRows(team,players,intel,season,{scope,ids,year:season,minimum:1,...props},phase,lineups);
test('contracts require explicit terms and expiration evidence across teams',()=>{
 assert.equal(query('TEAM',[]).length,5);
 const league=query('NBA LEAGUE',[]);
 assert.deepEqual(rankPlayers(league,['expiring','teamOption'],'Combined fit',{demo:true}).map(r=>r.player.nbaPlayerId),[6]);
});
test('verified lineups resolve five distinct eligible portraits, minimum and defensive rating',()=>{
 const lineup={team:'ATL',season,ids:[1,2,3,4,5],off:20,def:25,allowed:24,scored:22,source,verifiedAt};
 const rows=query('TEAM',['lineup-defense'],{}, {},[lineup,{...lineup,team:'UTA'}]);
 assert.equal(rows.length,1);assert.equal(rows[0].player.members.length,5);assert.equal(rows[0].metrics['lineup-defense'].value,96);
 assert.equal(query('TEAM',['lineup-defense'],{minimum:26},{},[lineup]).length,0);
});
test('scout pool isolates external identities and demo scores are repeatable',()=>{
 const phase={teams:[{pool:'NCAA_D1',season,players:[{key:'college:1',name:'A',position:'G'}]},{pool:'OVERSEAS_MEN',season,players:[{key:'other:1'}]}]};
 const rows=query('SCOUTING',[],{pool:'NCAA_D1'},phase);
 assert.equal(rows.length,1);assert.equal(rankPlayers(rows,['onBall'],'Combined fit').length,0);
 const run=()=>rankPlayers(rows,['onBall'],'Combined fit',{demo:true});
 assert.deepEqual(run(),run());assert.equal(run()[0].demo,true);
});
test('successive rings preserve minimum card separation and increasing distance',()=>{
 const {points}=ringPositions(35);let previous=0;
 for(const [i,[x,y]] of points.entries()){assert.ok(Math.hypot(x,y)>=previous);previous=Math.hypot(x,y);for(const [a,b] of points.slice(0,i))assert.ok(Math.hypot(x-a,y-b)>170);}
});
