import test from 'node:test';
import assert from 'node:assert/strict';
import {financialSources} from '../src/data/financial-sources.js';
import {financialView,groupPlayersBySalary,calculatePlayerCapShare,calculatePlayerPayrollShare,thresholdDistance,towerGeometry,resolveHardCapStatus} from '../src/financial-model.js';
import {premiumSalaryDashboard,capDashboardState} from '../src/components/salary-cap-dashboard.js';
import {teams} from '../src/data/teams.js';
import {scenarioState,removeFromProposal} from '../src/roster-scenario.js';

const roster=Array.from({length:9},(_,index)=>({nbaPlayerId:index+1,name:`Test Player ${index+1}`,team:'HOU',position:'G',jersey:String(index+1),supplementalStatus:0}));
const threshold={cap:100_000_000,minimum:90_000_000,tax:120_000_000,firstApron:130_000_000,secondApron:140_000_000,source:'https://example.org/fixture',verifiedAt:'2026-11-16'};
function sources(high=30_000_000){return {thresholds:{'2026-27':threshold},contracts:Object.fromEntries(roster.map((player,index)=>[player.nbaPlayerId,{'2026-27':{cap:index===8?high:3_200_000,team:'HOU',source:'https://example.org/fixture',verifiedAt:'2026-11-16'}}])),nonPlayerAllocations:{HOU:{'2026-27':{cap:[{type:'Dead money',amount:2_000_000,source:'https://example.org/fixture',verifiedAt:'2026-11-16'}]}}},allocationCoverage:{HOU:{'2026-27':{cap:'complete'}}}}}
test('official 2025-26 and 2026-27 thresholds are distinct, sourced and exact dollars',()=>{
 assert.deepEqual([financialSources.thresholds['2025-26'].minimum,financialSources.thresholds['2025-26'].cap,financialSources.thresholds['2025-26'].tax,financialSources.thresholds['2025-26'].firstApron,financialSources.thresholds['2025-26'].secondApron],[139182000,154647000,187895000,195945000,207824000]);
 assert.deepEqual([financialSources.thresholds['2026-27'].minimum,financialSources.thresholds['2026-27'].cap,financialSources.thresholds['2026-27'].tax,financialSources.thresholds['2026-27'].firstApron,financialSources.thresholds['2026-27'].secondApron],[148465000,164961000,200428000,209015000,221686000]);
});
test('eight exact matching salaries share one group and sum once',()=>{
 const view=financialView({players:roster,teamAbbr:'HOU',season:'2026-27',sources:sources()});
 const groups=groupPlayersBySalary(view.priced);
 assert.equal(groups.length,2);assert.equal(groups.find(group=>group.players.length===8).total,25_600_000);
 assert.equal(groups.reduce((sum,group)=>sum+group.total,0),view.knownPlayerTotal);
 assert.equal(view.total,57_600_000);assert.equal(view.knownOtherTotal,2_000_000);
 assert.equal(calculatePlayerCapShare(30_000_000,threshold.cap),30);
 assert.equal(calculatePlayerPayrollShare(30_000_000,view.total),30_000_000/57_600_000*100);
 assert.equal(thresholdDistance(view.total,threshold.cap),42_400_000);
});
test('similar grouping is opt-in and retains exact individual charges',()=>{
 const amounts=[{player:roster[0],amount:3_200_000},{player:roster[1],amount:3_250_000},{player:roster[2],amount:3_500_000}];
 assert.equal(groupPlayersBySalary(amounts).length,3);
 const grouped=groupPlayersBySalary(amounts,{similar:true,tolerance:.02});
 assert.equal(grouped.length,2);assert.equal(grouped[0].total+grouped[1].total,9_950_000);
 assert.deepEqual(grouped.flatMap(group=>group.players.map(item=>item.amount)).sort((a,b)=>a-b),[3_200_000,3_250_000,3_500_000]);
});
test('fill and threshold positions share one dollar axis below and above aprons',()=>{
 const low=financialView({players:roster,teamAbbr:'HOU',season:'2026-27',sources:sources()});
 const lowGeometry=towerGeometry(low);assert.ok(lowGeometry.fillPercent<lowGeometry.positions.minimum);assert.ok(lowGeometry.positions.secondApron<100);
 const high=financialView({players:roster,teamAbbr:'HOU',season:'2026-27',sources:sources(150_000_000)});
 const highGeometry=towerGeometry(high);assert.ok(highGeometry.fillPercent>highGeometry.positions.secondApron);assert.ok(highGeometry.fillPercent<100);
 assert.equal(towerGeometry({...high,mode:'cash'}),null);
});
test('missing and wrong-team contracts do not claim complete payroll; hard cap needs team trigger',()=>{
 const data=sources();delete data.contracts[1];assert.equal(financialView({players:roster,teamAbbr:'HOU',season:'2026-27',sources:data}).complete,false);
 data.contracts[1]={'2026-27':{cap:3_200_000,team:'BOS',source:'https://example.org/fixture',verifiedAt:'2026-11-16'}};
 assert.equal(financialView({players:roster,teamAbbr:'HOU',season:'2026-27',sources:data}).complete,false);
 assert.equal(resolveHardCapStatus(null).status,'unverified');
 assert.equal(resolveHardCapStatus({applicable:true,amount:130_000_000,trigger:'fixture transaction',source:'https://example.org/fixture'}).status,'confirmed');
});
test('expanded dashboard retains every player face, rule cards and source-aware no-payroll state',()=>{
 const team=teams.find(item=>item.abbr==='HOU');capDashboardState.rosterMode='original';
 const html=premiumSalaryDashboard(team,roster);
 assert.equal((html.match(/class="cap-portrait"/g)||[]).length,roster.length);
 assert.match(html,/UNVERIFIED/);assert.match(html,/Cap Zone Legend/);assert.match(html,/Hard Cap/);
 assert.match(html,/No reconciled team payroll/);
});
test('reconciled fixture renders grouped portraits with one payroll fill',()=>{
 const previous={contracts:financialSources.contracts,nonPlayerAllocations:financialSources.nonPlayerAllocations,allocationCoverage:financialSources.allocationCoverage};
 const fixture=sources();
 try{
  financialSources.contracts=fixture.contracts;financialSources.nonPlayerAllocations=fixture.nonPlayerAllocations;financialSources.allocationCoverage=fixture.allocationCoverage;
  capDashboardState.rosterMode='original';capDashboardState.similar=false;
  const html=premiumSalaryDashboard(teams.find(team=>team.abbr==='HOU'),roster);
  assert.match(html,/8 players · \$25\.600M combined/);
  assert.equal((html.match(/class="cap-portrait"/g)||[]).length,9);
  assert.match(html,/cap-zone-full/);assert.doesNotMatch(html,/UNVERIFIED/);
 }finally{financialSources.contracts=previous.contracts;financialSources.nonPlayerAllocations=previous.nonPlayerAllocations;financialSources.allocationCoverage=previous.allocationCoverage}
});
test('sandbox removal changes the roster index but never asserts cap relief',()=>{
 const before=structuredClone(scenarioState.current),oldMode=capDashboardState.rosterMode;
 try{
  scenarioState.current={team:null,removed:[],added:[],counterpartAdds:[],transfers:[],contractAssumptions:[],rotationAssumptions:[],revision:0,financialPending:false};
  assert.equal(removeFromProposal(roster,'HOU',1),true);capDashboardState.rosterMode='scenario';
  const html=premiumSalaryDashboard(teams.find(team=>team.abbr==='HOU'),roster);
  assert.equal((html.match(/class="cap-portrait"/g)||[]).length,8);
  assert.match(html,/financial treatment unverified/);assert.match(html,/UNVERIFIED/);
 }finally{scenarioState.current=before;capDashboardState.rosterMode=oldMode;scenarioState.selectedPlayer=null;scenarioState.drawer=false;scenarioState.undo=[];scenarioState.redo=[]}
});
