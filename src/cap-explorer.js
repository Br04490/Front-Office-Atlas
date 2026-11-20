import {towerGeometry} from './financial-model.js';

export const capExplorerState={mode:'explorer',team:null,season:null,excluded:[],undo:[],selectedPlayer:null,compare:false,lastChange:null,demo:false};
const validAmount=value=>Number.isSafeInteger(value)&&value>=0;
export function explorerSelection(players,team,season,sources,state=capExplorerState){
 const selected=state.team===team&&state.season===season?new Set(state.excluded):new Set();
 const records=players.map(player=>{const record=sources.contracts?.[player.nbaPlayerId]?.[season];const verified=record?.team===team&&record.source&&record.verifiedAt&&validAmount(record.cap);const amount=verified?record.cap:(state.demo?1_000_000:null);return {player,record,amount,excluded:selected.has(player.nbaPlayerId),demo:!verified&&state.demo} });
 const included=records.filter(row=>!row.excluded),known=included.filter(row=>validAmount(row.amount));
 const unknown=included.filter(row=>!validAmount(row.amount));
 const baselineComplete=records.every(row=>validAmount(row.amount));
 const total=unknown.length?null:known.reduce((sum,row)=>sum+row.amount,0);
 const baseline=baselineComplete?records.reduce((sum,row)=>sum+row.amount,0):null;
 const removed=baselineComplete?baseline-total:null;
 return {records,included,known,unknown,total,baseline,removed,baselineComplete,selectedCount:included.length,originalCount:records.length};
}
export function explorerGeometry(selection,threshold){
 if(!threshold)return null;
 const geometry=towerGeometry({mode:'cap',threshold,complete:selection.baselineComplete,total:selection.baseline});
 return geometry?{...geometry,fillPercent:selection.total===null?null:selection.total/geometry.maxDollars*100}:null;
}
export function explorerAction(action,players,team,season,sources,id,state=capExplorerState){
 if(state.team!==team||state.season!==season){state.team=team;state.season=season;state.excluded=[];state.undo=[];state.selectedPlayer=null;state.lastChange=null}
 const before=explorerSelection(players,team,season,sources,state);
 if(action==='select'){state.selectedPlayer=Number(id);return true}
 if(action==='close'){state.selectedPlayer=null;return true}
 if(action==='compare'){state.compare=!state.compare;return true}
 if(action==='demo-toggle'){state.demo=!state.demo;state.excluded=[];state.undo=[];state.lastChange=null;return true}
 if(action==='undo'){if(!state.undo.length)return false;state.excluded=state.undo.pop();state.lastChange=null;return true}
 if(action==='restore-all'){if(!state.excluded.length)return false;state.undo.push([...state.excluded]);state.excluded=[];state.lastChange={kind:'restore',amount:before.removed};return true}
 const player=players.find(row=>row.nbaPlayerId===Number(id));if(!player)return false;
 if(action==='remove'&&!state.excluded.includes(player.nbaPlayerId)){state.undo.push([...state.excluded]);state.excluded.push(player.nbaPlayerId);state.lastChange={kind:'remove',player:player.name,amount:before.records.find(row=>row.player.nbaPlayerId===player.nbaPlayerId)?.amount};state.selectedPlayer=null;return true}
 if(action==='restore'&&state.excluded.includes(player.nbaPlayerId)){state.undo.push([...state.excluded]);state.excluded=state.excluded.filter(value=>value!==player.nbaPlayerId);state.lastChange={kind:'restore',player:player.name,amount:before.records.find(row=>row.player.nbaPlayerId===player.nbaPlayerId)?.amount};return true}
 return false;
}
