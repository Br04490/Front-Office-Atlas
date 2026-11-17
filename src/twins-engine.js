// Independent Atlas comparison. It is not a licensed provider similarity grade.
const specs=[['points',.25,35],['rebounds',.18,15],['assists',.18,12],['minutes',.14,40],['tsPct',.15,.25],['usage',.10,.35]];
const valid=item=>item&&Number.isFinite(item.value)&&/^https:\/\//.test(item.source||'')&&item.verifiedAt;
export function statisticalTwins(anchor,players,intelligence,season,{limit=5,minGames=8,positionOnly=false}={}){
  const source=intelligence?.players?.[anchor.nbaPlayerId]?.seasons?.[season]?.metrics||{};
  const anchorGames=source.games?.value;
  if(!Number.isFinite(anchorGames)||anchorGames<minGames)return {status:'insufficient_data',reason:`Selected player needs at least ${minGames} sourced games in ${season}.`,pool:0,matches:[]};
  const keys=specs.filter(([key])=>valid(source[key]));
  if(keys.length<specs.length)return {status:'insufficient_data',reason:'All six sourced performance measures are required for this Atlas formula.',pool:0,matches:[]};
  const candidates=players.filter(player=>player.nbaPlayerId!==anchor.nbaPlayerId).map(player=>{
    if(positionOnly&&player.position!==anchor.position)return null;
    const metrics=intelligence?.players?.[player.nbaPlayerId]?.seasons?.[season]?.metrics||{};
    if(!Number.isFinite(metrics.games?.value)||metrics.games.value<minGames||!keys.every(([key])=>valid(metrics[key])))return null;
    let weightedError=0,weight=0;
    const differences=keys.map(([key,w,scale])=>{
      const a=source[key].value,b=metrics[key].value;
      weightedError+=w*Math.min(1,Math.abs(a-b)/scale);weight+=w;
      return {key,anchor:a,peer:b,unit:source[key].unit,source:metrics[key].source,verifiedAt:metrics[key].verifiedAt};
    });
    return {player,score:Math.round(100*(1-weightedError/weight)),differences,games:metrics.games.value,source:metrics.games.source};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.player.name.localeCompare(b.player.name));
  return {status:'ok',pool:candidates.length,matches:candidates.slice(0,limit),method:'Atlas v1: weighted capped absolute differences in PPG (25%), RPG (18%), APG (18%), MPG (14%), TS% (15%), usage (10%). Each difference is divided by a fixed published scale; missing values exclude the candidate. No pace, role or era adjustment.'};
}

const modes=new Set(['very-close','close','statistical','physical','age','contract','scheme']);
const physicalKeys=['height','weight','wingspan'];
const seasonRecord=(data,id,season)=>data?.players?.[id]?.seasons?.[season]||{};
const datedAge=(item,season)=>{
  if(!item||!/^\d{4}-\d{2}-\d{2}$/.test(item.value||'')||!/^https:\/\//.test(item.source||'')||!item.verifiedAt)return null;
  const birthday=new Date(`${item.value}T00:00:00Z`),asOf=new Date(`${season.slice(0,4)}-10-01T00:00:00Z`);
  if(Number.isNaN(birthday.getTime())||birthday>=asOf)return null;
  return (asOf-birthday)/(365.2425*86400000);
};
const verifiedNumber=item=>valid(item)?item.value:null;
const roleLabels=record=>new Set((record?.roles||[]).filter(item=>item?.label&&/^https:\/\//.test(item.source||'')&&item.verifiedAt).map(item=>item.label.toLowerCase()));
function dimensions(player,data,season,mode){
 const record=data?.players?.[player.nbaPlayerId]||{},current=seasonRecord(data,player.nbaPlayerId,season),metrics=current.metrics||{};
 const out={};
 if(['statistical','very-close','close','scheme'].includes(mode)){
  if(verifiedNumber(metrics.games)<8)return null;
  for(const [key] of specs){const value=verifiedNumber(metrics[key]);if(value===null)return null;out[key]={value,source:metrics[key].source,verifiedAt:metrics[key].verifiedAt,unit:metrics[key].unit||''}}
 }
 if(['physical','very-close','close'].includes(mode))for(const key of physicalKeys){
  const item=record.physical?.[key],value=verifiedNumber(item);
  if(value===null)return null;out[key]={value,source:item.source,verifiedAt:item.verifiedAt,unit:item.unit||''};
 }
 if(['age','very-close','close'].includes(mode)){
  const item=record.birthDate||record.physical?.birthDate,age=datedAge(item,season);
  if(age===null)return null;out.age={value:age,source:item.source,verifiedAt:item.verifiedAt,unit:'years'};
 }
 if(['scheme','very-close'].includes(mode)){
  const roles=roleLabels(current);if(!roles.size)return null;
  out.roles={roles,source:current.roles[0].source,verifiedAt:current.roles[0].verifiedAt};
 }
 if(mode==='contract'){
  const item=data?.contracts?.[player.nbaPlayerId]?.[season];
  if(!item||!Number.isFinite(item.cap)||!/^https:\/\//.test(item.source||'')||!item.verifiedAt||!item.contractType)return null;
  out.cap={value:item.cap,source:item.source,verifiedAt:item.verifiedAt,unit:'USD'};
  out.contractType={value:item.contractType,source:item.source,verifiedAt:item.verifiedAt,unit:'type'};
 }
 return out;
}
export function findTwins(anchor,players,data,season,{mode='statistical',limit=3,heightTolerance=2,weightTolerance=15,ageTolerance=2}={}){
 if(!modes.has(mode))throw Error('Unsupported twin mode');
 if(mode==='statistical')return statisticalTwins(anchor,players,data,season,{limit});
 const base=dimensions(anchor,data,season,mode);
 if(!base)return {status:'insufficient_data',reason:`${mode} requires verified comparable inputs for the selected player in ${season}.`,pool:0,matches:[]};
 const scale={height:Math.max(1,Number(heightTolerance)||2),weight:Math.max(1,Number(weightTolerance)||15),wingspan:4,age:Math.max(.5,Number(ageTolerance)||2),cap:20_000_000,points:35,rebounds:15,assists:12,minutes:40,tsPct:.25,usage:.35};
 const weights={height:1,weight:1,wingspan:1,age:1,cap:1,contractType:1,roles:1,...Object.fromEntries(specs.map(([key,weight])=>[key,weight*6]))};
 const matches=players.filter(player=>player.nbaPlayerId!==anchor.nbaPlayerId).map(player=>{
  const peer=dimensions(player,data,season,mode);if(!peer)return null;
  if(['physical','very-close','close'].includes(mode)){
   const factor=mode==='close'?2:1;
   if(Math.abs(base.height.value-peer.height.value)>scale.height*factor||Math.abs(base.weight.value-peer.weight.value)>scale.weight*factor)return null;
  }
  if(base.age&&Math.abs(base.age.value-peer.age.value)>scale.age*(mode==='close'?2:1))return null;
  const differences=[],keys=Object.keys(base);let error=0,total=0;
  for(const key of keys){
   const left=base[key],right=peer[key],weight=weights[key]||1;
   let distance;
   if(key==='roles'){const shared=[...left.roles].filter(role=>right.roles.has(role)).length,union=new Set([...left.roles,...right.roles]).size;distance=1-shared/union;differences.push({key,anchor:1,peer:1-distance,unit:'role overlap',source:right.source,verifiedAt:right.verifiedAt})}
   else if(key==='contractType'){distance=left.value===right.value?0:1;differences.push({key,anchor:distance?1:0,peer:distance,unit:`${left.value} / ${right.value}`,source:right.source,verifiedAt:right.verifiedAt})}
   else{distance=Math.min(1,Math.abs(left.value-right.value)/scale[key]);differences.push({key,anchor:left.value,peer:right.value,unit:left.unit,source:right.source,verifiedAt:right.verifiedAt})}
   error+=weight*distance;total+=weight;
  }
  return {player,score:Math.round(100*(1-error/total)),differences,source:differences[0].source,verifiedAt:differences[0].verifiedAt,coverage:`${keys.length} of ${keys.length} required dimensions`};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.player.name.localeCompare(b.player.name));
 return {status:matches.length?'ok':'insufficient_data',reason:matches.length?'':`No other player has all verified ${mode} inputs within the selected tolerances.`,pool:matches.length,matches:matches.slice(0,limit),method:`Atlas ${mode} v1: weighted capped absolute differences across ${Object.keys(base).join(', ')}; missing inputs exclude a candidate. A score is descriptive, not a forecast or proprietary grade.`};
}
