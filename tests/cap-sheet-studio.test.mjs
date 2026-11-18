import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCapSheet,capSheetCsv,capSheetTypes,capSheetStudio} from '../src/cap-sheet-studio.js';
import {financialSources} from '../src/data/financial-sources.js';
import {scenarioState,removeFromProposal} from '../src/roster-scenario.js';

const players=[{nbaPlayerId:1,name:'First Fixture',team:'HOU',supplementalStatus:0},{nbaPlayerId:2,name:'Second Fixture',team:'HOU',supplementalStatus:0}];
const rights='https://example.org/authorized-fixture';
function sources(){return {thresholds:{'2026-27':financialSources.thresholds['2026-27']},contracts:{1:{'2026-27':{team:'HOU',cap:20_000_000,source:rights,verifiedAt:'2026-11-18'}},2:{'2026-27':{team:'HOU',cap:10_000_000,source:rights,verifiedAt:'2026-11-18'}}},nonPlayerAllocations:{HOU:{'2026-27':{cap:[{amount:2_000_000,source:rights,verifiedAt:'2026-11-18'}]}}},allocationCoverage:{HOU:{'2026-27':{cap:'complete'}}}}}
test('all 15 worksheet types render with explicit source or missing input',()=>{
 for(const [type] of capSheetTypes){const sheet=buildCapSheet({players,team:'HOU',season:'2026-27',type,sources:sources()});assert.equal(sheet.type,type);assert.ok(sheet.rows.length>0);assert.ok(sheet.rows.every(row=>row.source||row.note));}
});
test('reconciled fixture uses the shared financial model for team salary and apron distance',()=>{
 const sheet=buildCapSheet({players,team:'HOU',season:'2026-27',type:'firstApron',sources:sources()});
 assert.equal(sheet.baselineSalary,32_000_000);
 assert.equal(sheet.rows.find(row=>row.label==='Distance to first apron').before,177_015_000);
 assert.equal(sheet.rows.find(row=>row.label==='Player cap charges subtotal').before,30_000_000);
 const csv=capSheetCsv(sheet);assert.match(csv,/"177015000"/);assert.match(csv,/"https:\/\/pr\.nba\.com/);
});
test('missing contract keeps team totals and distances pending',()=>{
 const data=sources();delete data.contracts[2];const sheet=buildCapSheet({players,team:'HOU',season:'2026-27',type:'cap',sources:data});
 assert.equal(sheet.baselineSalary,null);assert.equal(sheet.rows.find(row=>row.label==='Reconciled team salary').before,null);assert.equal(sheet.rows.find(row=>row.label==='Distance to NBA salary cap').before,null);
});
test('roster experiment changes selected identities but cannot assert official transaction relief',()=>{
 const previous=structuredClone(scenarioState.current),undo=[...scenarioState.undo],redo=[...scenarioState.redo];
 try{scenarioState.current={team:null,removed:[],added:[],counterpartAdds:[],transfers:[],contractAssumptions:[],rotationAssumptions:[],revision:0,financialPending:false};assert.equal(removeFromProposal(players,'HOU',1),true);const sheet=buildCapSheet({players,team:'HOU',season:'2026-27',type:'roster',sources:sources()});assert.equal(sheet.baselineSalary,32_000_000);assert.equal(sheet.scenarioSalary,null);assert.equal(sheet.rows.find(row=>row.label==='Standard roster players priced').after,1);}finally{scenarioState.current=previous;scenarioState.undo=undo;scenarioState.redo=redo}
});
test('live studio has official thresholds and no fabricated team payroll',()=>{
 const html=capSheetStudio(players);assert.match(html,/Cap Sheet Studio/);assert.match(html,/\$164,961,000/);assert.match(html,/ORIGINAL TEAM SALARY: Pending/);
});
