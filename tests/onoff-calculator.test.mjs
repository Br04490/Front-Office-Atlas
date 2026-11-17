import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateOnOff} from '../src/onoff-calculator.js';
const base={gameId:'0022600001',team:'HOU',season:'2026-27',source:'https://example.org/authorized-pbp'};
const row=(possessionId,side,points,on)=>({...base,possessionId,side,points,onCourtPlayerIds:on?[1,2,3,4,5]:[2,3,4,5,6]});
test('on/off rates count team possessions, not box-score minutes',()=>{
  const rows=[row(1,'offense',2,true),row(2,'defense',0,true),row(3,'offense',3,false),row(4,'defense',2,false)];
  const result=calculateOnOff(rows,{nbaPlayerId:1,team:'HOU',season:'2026-27'});
  assert.equal(result.on.offensiveRating,200);
  assert.equal(result.on.defensiveRating,0);
  assert.equal(result.off.netRating,100);
  assert.equal(result.netDifference,100);
  assert.throws(()=>calculateOnOff([...rows,rows[0]],{nbaPlayerId:1,team:'HOU',season:'2026-27'}),/Duplicate possession/);
  assert.equal(calculateOnOff([],{nbaPlayerId:1,team:'HOU',season:'2026-27'}).netDifference,null);
});
