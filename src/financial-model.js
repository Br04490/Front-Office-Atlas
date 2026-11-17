export const financialModes={cap:'CAP VIEW',tax:'TAX VIEW',cash:'CASH PAYROLL VIEW',aav:'AVERAGE ANNUAL VALUE VIEW'};
export const seasons=['2025-26','2026-27','2027-28','2028-29','2029-30','2030-31','2031-32'];
export const isTwoWay=player=>Number(player.supplementalStatus)===1;
const finite=value=>Number.isSafeInteger(value)&&value>=0;

export const calculatePlayerCapShare=(amount,cap)=>finite(amount)&&finite(cap)&&cap>0?amount/cap*100:null;
export const calculatePlayerPayrollShare=(amount,total)=>finite(amount)&&finite(total)&&total>0?amount/total*100:null;
export const thresholdDistance=(total,threshold)=>finite(total)&&finite(threshold)?threshold-total:null;
export function towerGeometry(view){
  const t=view.threshold;
  if(view.mode!=='cap'||!t||!finite(t.secondApron)||!finite(t.cap))return null;
  const maxDollars=Math.max(Math.ceil(t.secondApron*1.10/5_000_000)*5_000_000,view.complete?Math.ceil(view.total*1.08/5_000_000)*5_000_000:0);
  const positions=Object.fromEntries(['minimum','cap','tax','firstApron','secondApron'].map(key=>[key,t[key]/maxDollars*100]));
  return {maxDollars,positions,fillPercent:view.complete?view.total/maxDollars*100:null};
}
export function groupPlayersBySalary(priced,{similar=false,tolerance=.02}={}){
  if(!Number.isFinite(tolerance)||tolerance<0||tolerance>.1)throw Error('Invalid salary grouping tolerance');
  const sorted=[...priced].filter(item=>finite(item.amount)).sort((a,b)=>b.amount-a.amount||a.player.nbaPlayerId-b.player.nbaPlayerId);
  const groups=[];
  for(const item of sorted){
    const last=groups.at(-1),match=last&&(similar?Math.abs(last.anchor-item.amount)<=last.anchor*tolerance:last.anchor===item.amount);
    if(match){last.players.push(item);last.total+=item.amount}
    else groups.push({anchor:item.amount,players:[item],total:item.amount});
  }
  return groups;
}
export function resolveHardCapStatus(hard){
  if(hard?.applicable===true&&finite(hard.amount)&&hard.trigger&&hard.source)return {status:'confirmed',ceiling:hard.amount,trigger:hard.trigger,source:hard.source};
  if(hard?.applicable===false&&hard.source&&hard.verifiedAt)return {status:'not_triggered',source:hard.source};
  return {status:'unverified'};
}

export function financialView({players,season,mode='cap',sources,scenario,teamAbbr}){
  const standard=players.filter(player=>!isTwoWay(player));
  const twoWay=players.filter(isTwoWay);
  const threshold=sources.thresholds?.[season]||null;
  const cap=finite(threshold?.cap)&&threshold.cap>0&&threshold.source&&threshold.verifiedAt?threshold.cap:null;
  const team=teamAbbr||players[0]?.team;
  const playerAmounts=standard.map(player=>{const record=sources.contracts?.[player.nbaPlayerId]?.[season];return {player,amount:record?.source&&record?.verifiedAt&&(!record.team||record.team===team)?record[mode]:null,record}});
  const priced=playerAmounts.filter(item=>finite(item.amount));
  const unpriced=playerAmounts.filter(item=>!finite(item.amount));
  const nonPlayer=(sources.nonPlayerAllocations?.[team]?.[season]?.[mode]||[]).filter(item=>finite(item.amount)&&item.source&&item.verifiedAt);
  const knownPlayerTotal=priced.reduce((sum,item)=>sum+item.amount,0);
  const knownOtherTotal=nonPlayer.reduce((sum,item)=>sum+item.amount,0);
  const comparable=mode==='cap'||mode==='tax';
  const allocationsAttested=sources.allocationCoverage?.[team]?.[season]?.[mode]==='complete';
  const complete=(comparable?!!cap:knownPlayerTotal+knownOtherTotal>0)&&unpriced.length===0&&allocationsAttested&&(!scenario||!scenario.financialPending);
  const total=complete?knownPlayerTotal+knownOtherTotal:null;
  const scaleBase=comparable?cap:total;
  const maxPercent=complete&&comparable?Math.max(150,Math.ceil(total/cap*4)*25):comparable?150:100;
  const hardRecord=sources.hardCaps?.[team]?.[season];
  const hardCap=hardRecord?.applicable===true&&finite(hardRecord.amount)&&hardRecord.trigger&&hardRecord.source?hardRecord:null;
  const markers=cap&&comparable?[['Minimum team salary',threshold.minimum],['NBA salary cap',cap],['Luxury-tax threshold',threshold.tax],['First apron',threshold.firstApron],['Second apron',threshold.secondApron],...(hardCap?[[`Hard cap · ${hardCap.trigger}`,hardCap.amount]]:[])].filter(([,amount])=>finite(amount)).map(([label,amount])=>({label,amount,percent:amount/cap*100})):[];
  return {season,mode,cap,threshold,standard,twoWay,priced,unpriced,nonPlayer,knownPlayerTotal,knownOtherTotal,total,complete,maxPercent,markers,hardCap,hardCapStatus:resolveHardCapStatus(hardRecord),source:threshold?.source||null,financialPending:!!scenario?.financialPending,scaleBase,comparable,axisMeaning:comparable?'Percent of NBA salary cap':mode==='cash'?'Percent of team cash payroll':'Percent of team average annual value total'};
}

// Each band's height is its exact sum as a share of the cap. Within a band,
// each player's horizontal share is proportional to that player's amount.
export function salaryBands(priced,cap,targetFraction=.20){
  if(!finite(cap)||cap===0)return [];
  const sorted=[...priced].filter(item=>finite(item.amount)&&item.amount>0).sort((a,b)=>b.amount-a.amount);
  const bands=[];let small=[];let smallTotal=0;const target=cap*targetFraction;
  const flush=()=>{if(small.length){bands.push({players:small,total:smallTotal,heightPercent:smallTotal/cap*100});small=[];smallTotal=0}};
  for(const item of sorted){if(item.amount>=target){flush();bands.push({players:[item],total:item.amount,heightPercent:item.amount/cap*100});continue}if(smallTotal+item.amount>target&&small.length)flush();small.push(item);smallTotal+=item.amount}flush();
  return bands.map(band=>({...band,players:band.players.map(item=>({...item,widthPercent:item.amount/band.total*100}))}));
}
