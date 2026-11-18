import test from 'node:test';
import assert from 'node:assert/strict';
import {explorerSelection,explorerGeometry,explorerAction} from '../src/cap-explorer.js';
import {financialSources} from '../src/data/financial-sources.js';

const hou=Array.from({length:15},(_,i)=>({nbaPlayerId:i+1,name:`Houston ${i+1}`,team:'HOU'}));
const bos=[{nbaPlayerId:100,name:'Boston Player',team:'BOS'}];
const players=[...hou,...bos];
const threshold=financialSources.thresholds['2026-27'];
const contracts=Object.fromEntries(players.map((player,i)=>[player.nbaPlayerId,{'2026-27':{team:player.team,cap:i<2?20_000_000:10_000_000,source:'https://example.org/licensed-fixture',verifiedAt:'2026-11-16'}}]));
const sources={contracts};
const state=()=>({mode:'explorer',team:null,season:null,excluded:[],undo:[],selectedPlayer:null,compare:false,lastChange:null});
const value=s=>explorerSelection(hou,'HOU','2026-27',sources,s);
test('15 fixture players total once and removal holds a fixed dollar axis',()=>{
 const s=state(),original=value(s),axis=explorerGeometry(original,threshold);
 assert.equal(original.total,170_000_000);
 assert.equal(original.selectedCount,15);
 assert.equal(explorerAction('remove',hou,'HOU','2026-27',sources,1,s),true);
 const after=value(s),newAxis=explorerGeometry(after,threshold);
 assert.equal(after.total,150_000_000);
 assert.equal(after.removed,20_000_000);
 assert.equal(newAxis.maxDollars,axis.maxDollars);
 assert.deepEqual(newAxis.positions,axis.positions);
 assert.equal(newAxis.fillPercent,150_000_000/newAxis.maxDollars*100);
 assert.equal(explorerAction('remove',hou,'HOU','2026-27',sources,1,s),false);
 assert.equal(value(s).total,150_000_000);
});
test('identical salaries remove independently, empty completely, restore and undo',()=>{
 const s=state();
 explorerAction('remove',hou,'HOU','2026-27',sources,1,s);
 explorerAction('remove',hou,'HOU','2026-27',sources,2,s);
 assert.equal(value(s).total,130_000_000);
 for(const player of hou.slice(2))explorerAction('remove',hou,'HOU','2026-27',sources,player.nbaPlayerId,s);
 assert.equal(value(s).total,0);
 assert.equal(value(s).selectedCount,0);
 assert.equal(explorerGeometry(value(s),threshold).fillPercent,0);
 explorerAction('undo',hou,'HOU','2026-27',sources,null,s);
 assert.equal(value(s).total,10_000_000);
 explorerAction('restore-all',hou,'HOU','2026-27',sources,null,s);
 assert.equal(value(s).total,170_000_000);
 assert.equal(value(s).selectedCount,15);
});
test('team and season changes reset excluded identity without touching source roster',()=>{
 const s=state();explorerAction('remove',hou,'HOU','2026-27',sources,1,s);
 explorerAction('select',bos,'BOS','2026-27',sources,100,s);
 assert.deepEqual(s.excluded,[]);
 assert.equal(explorerSelection(bos,'BOS','2026-27',sources,s).total,10_000_000);
 assert.equal(hou.length,15);
 explorerAction('select',hou,'HOU','2025-26',sources,1,s);
 assert.equal(explorerSelection(hou,'HOU','2025-26',sources,s).total,null);
});
test('missing charge never becomes zero except when no players are selected',()=>{
 const s=state(),partial={contracts:{...contracts}};partial.contracts[1]={'2026-27':{team:'BOS',cap:20_000_000,source:'https://example.org/fixture',verifiedAt:'2026-11-16'}};
 assert.equal(explorerSelection(hou,'HOU','2026-27',partial,s).total,null);
 for(const player of hou)explorerAction('remove',hou,'HOU','2026-27',partial,player.nbaPlayerId,s);
 assert.equal(explorerSelection(hou,'HOU','2026-27',partial,s).total,0);
});
