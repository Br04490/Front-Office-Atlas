import test from 'node:test';
import assert from 'node:assert/strict';
import {statisticalTwins} from '../src/twins-engine.js';

const roster=[{nbaPlayerId:1,name:'Alpha',position:'G'},{nbaPlayerId:2,name:'Beta',position:'G'},{nbaPlayerId:3,name:'Gamma',position:'F'}];
const measure=value=>({value,source:'https://example.org/authorized',verifiedAt:'2026-11-16',unit:'per game'});
const season=(points,rebounds,assists,minutes,tsPct,usage)=>({seasons:{'2026-27':{metrics:{games:measure(20),points:measure(points),rebounds:measure(rebounds),assists:measure(assists),minutes:measure(minutes),tsPct:measure(tsPct),usage:measure(usage)}}}});
test('statistical twins rank sourced comparable players without using names',()=>{
  const data={players:{1:season(20,5,7,32,.60,.27),2:season(21,5.2,7.1,33,.61,.28),3:season(8,10,2,20,.48,.16)}};
  const result=statisticalTwins(roster[0],roster,data,'2026-27');
  assert.equal(result.pool,2);
  assert.equal(result.matches[0].player.nbaPlayerId,2);
  assert.ok(result.matches[0].score>result.matches[1].score);
  assert.equal(result.matches[0].differences.length,6);
  const renamed=roster.map(player=>({...player,name:`Unrelated ${player.nbaPlayerId}`}));
  assert.equal(statisticalTwins(renamed[0],renamed,data,'2026-27').matches[0].score,result.matches[0].score);
  delete data.players[2].seasons['2026-27'].metrics.tsPct;
  assert.equal(statisticalTwins(roster[0],roster,data,'2026-27').pool,1);
});
test('missing source or short sample produces no similarity score',()=>{
  const data={players:{1:season(20,5,7,32,.60,.27),2:season(21,5,7,32,.60,.27)}};
  data.players[1].seasons['2026-27'].metrics.games.value=3;
  assert.equal(statisticalTwins(roster[0],roster,data,'2026-27').status,'insufficient_data');
});
