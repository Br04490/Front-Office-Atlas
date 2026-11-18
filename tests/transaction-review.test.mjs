import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarioState,removeFromProposal} from '../src/roster-scenario.js';
import {createReviewCase,verifyReviewCase,transactionReviewPanel} from '../src/transaction-review.js';

const players=[{nbaPlayerId:1,name:'Fixture One',team:'HOU',supplementalStatus:0},{nbaPlayerId:2,name:'Fixture Two',team:'HOU',supplementalStatus:0}];
const initial=()=>({team:null,removed:[],added:[],counterpartAdds:[],transfers:[],contractAssumptions:[],rotationAssumptions:[],revision:0,financialPending:false});
test('transaction review requires a real scenario and never approves missing CBA evidence',()=>{
 const previous=structuredClone(scenarioState.current),undo=[...scenarioState.undo],redo=[...scenarioState.redo],state={cases:[],selectedId:null,error:''};
 try{scenarioState.current=initial();assert.equal(createReviewCase(players,'HOU','2026-27',state),null);assert.match(state.error,/roster proposal/);
  removeFromProposal(players,'HOU',1);const entry=createReviewCase(players,'HOU','2026-27',state);assert.equal(entry.status,'DRAFT');assert.deepEqual(entry.outgoing,[1]);
  verifyReviewCase(entry,players);assert.equal(entry.status,'NEEDS REVIEW');assert.equal(entry.checks.find(check=>check.name==='CBA transaction rules').result,'NEEDS REVIEW');assert.match(transactionReviewPanel(state),/Prepare internal documents/);assert.ok(entry.audit.length>=3);
 }finally{scenarioState.current=previous;scenarioState.undo=undo;scenarioState.redo=redo;scenarioState.selectedPlayer=null;scenarioState.drawer=false}
});
test('a changed scenario blocks stale financial review',()=>{
 const previous=structuredClone(scenarioState.current),undo=[...scenarioState.undo],redo=[...scenarioState.redo],state={cases:[],selectedId:null,error:''};
 try{scenarioState.current=initial();removeFromProposal(players,'HOU',1);const entry=createReviewCase(players,'HOU','2026-27',state);removeFromProposal(players,'HOU',2);verifyReviewCase(entry,players);assert.equal(entry.status,'BLOCKED');assert.match(entry.checks[0].detail,/proposal changed/)}finally{scenarioState.current=previous;scenarioState.undo=undo;scenarioState.redo=redo;scenarioState.selectedPlayer=null;scenarioState.drawer=false}
});
