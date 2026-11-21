import {trendSeries} from './components/player-trends.js';
export const pools = ['NCAA_D1','NCAA_D2','G_LEAGUE','OVERSEAS_MEN','GRASSROOTS_BOYS','HIGH_SCHOOL'];
export const scopes = ['TEAM','NBA LEAGUE','SCOUTING'];
const scoutCodes={'averages.avgSteals':'stealsPerGame','averages.avgBlocks':'blocksPerGame','averages.avgTurnovers':'turnoversPerGame','averages.fieldGoalPct':'fgPct','averages.freeThrowPct':'ftPct','averages.threePointFieldGoalPct':'threePct','averages.avgPoints':'points','averages.avgAssists':'assists','averages.avgMinutes':'minutes','averages.avgRebounds':'rebounds'};
export const scoutFeeds=new Map();
export async function loadScout(pool,update) {
  if(scoutFeeds.has(pool)||!['NCAA_D1','OVERSEAS_MEN','GRASSROOTS_BOYS'].includes(pool))return;
  const feed={status:'Loading',metrics:new Map()};
  scoutFeeds.set(pool,feed);
  try{
    const response=await fetch('/api/foundation/sandbox-values?league='+encodeURIComponent(pool));
    if(!response.ok)throw Error('Feed unavailable');
    for(const r of (await response.json()).rows){
      const m=feed.metrics.get(r.atlas_person_id)||{};
      m[scoutCodes[r.metric_code]]={value:r.metric_value,unit:r.unit,source:r.source_url,verifiedAt:r.updated_at};
      feed.metrics.set(r.atlas_person_id,m);
    }
    feed.status='Loaded';
  }catch{feed.status='Unavailable';}
  update();
}
export const uid=p=>String(p.key??p.nbaPlayerId);
const measure=(value,unit,r)=>({value,unit,source:r.source||r.sourceUrl,verifiedAt:r.verifiedAt});
// Use the same dated, sourced game-log series as the player Trends tab.
function recentMetrics(record,season,team,count) {
  const selected=trendSeries(record,'points',count).logs
    .filter(log=>log.season===season&&(!team||log.team===team)).slice(-count);
  if(selected.length!==count)return {};
  const latest=selected.at(-1),metrics={};
  const sum=k=>selected.every(log=>Number.isFinite(log[k]))?selected.reduce((n,log)=>n+log[k],0):null;
  const put=(k,value,unit)=>{if(Number.isFinite(value))metrics[k]={value,unit,source:latest.source,verifiedAt:latest.verifiedAt,sample:count+' games',sources:[...new Set(selected.map(g=>g.source))]};};
  for(const key of ['points','assists','rebounds','minutes','steals','blocks','turnovers']){
    const total=sum(key);
    if(total===null)continue;
    const perGame=['steals','blocks','turnovers'].includes(key)?key+'PerGame':key;
    put(perGame,total/count,'per game');put(key+'Total',total,'count');
  }
  for(const [key,made,attempts,totalKey] of [['threePct','threeMakes','threeAttempts','threePointAttempts'],['fgPct','fieldGoalsMade','fieldGoalAttempts','fieldGoalAttempts'],['ftPct','freeThrowsMade','freeThrowAttempts','freeThrowAttempts']]){
    const num=sum(made),den=sum(attempts);
    put(totalKey,den,'count');
    if(num!==null&&den>0)put(key,num/den,'fraction');
  }
  const fga=sum('fieldGoalAttempts'),fta=sum('freeThrowAttempts'),pts=sum('points');
  if(pts!==null&&fga!==null&&fta!==null&&fga+.44*fta>0)put('tsPct',pts/(2*(fga+.44*fta)),'fraction');
  return metrics;
}

export function buildRows(team,players,intelligence,season,s,phase,lineups){
  if(s.scope==='SCOUTING'){
    const teams=(phase?.teams||[]).filter(t=>t.pool===s.pool&&t.season===season);
    return teams.flatMap(t=>t.players.filter(p=>
      (!s.position||p.position===s.position)&&(!s.classYear||p.classOrExperience===s.classYear)&&
      (!s.geo||[p.hometown,t.city,t.state_code,t.campus_region].join(' ').toLowerCase().includes(s.geo.toLowerCase()))&&
      (!s.role||p.projectedRole===s.role)).map(p=>{
      const metrics={...scoutFeeds.get(s.pool)?.metrics.get(p.atlasPersonId)};
      const size=/^(\d+)[-'′](\d+)/.exec(p.height||'');
      if(size)metrics.height=measure(12*Number(size[1])+Number(size[2]),'in',p);
      if(p.weight&&Number.isFinite(+p.weight))metrics.weight=measure(+p.weight,'lb',p);
      if(p.dateOfBirth){const age=Math.floor((Date.UTC(parseInt(season),9,1)-Date.parse(p.dateOfBirth))/31556952000);if(Number.isFinite(age))metrics.age=measure(age,'years',p)}
      return {player:{...p,team:t.official_name},metrics};
    })).filter(r=>(!s.height||r.metrics.height?.value>=+s.height)&&(!s.age||r.metrics.age?.value<+s.age));
  }
  const lineupId=s.ids.find(id=>id.startsWith('lineup-'));
  if(lineupId){
    const situation={'lineup-pnr':'pick_and_roll','lineup-clutch':'clutch','lineup-switch':'switching'}[lineupId];
    const roster=new Map(players.filter(p=>p.team===team.abbr).map(p=>[p.nbaPlayerId,p]));
    return (lineups||[]).filter(r=>r.team===team.abbr&&r.season===season&&(!situation||r.situation===situation)&&new Set(r.ids).size===5&&r.ids.length===5&&r.ids.every(id=>roster.has(id))&&
      (!s.anchor||r.ids.includes(+s.anchor))&&r.def>=s.minimum&&(lineupId==='lineup-defense'||r.off>=s.minimum)).map(r=>{
      const members=r.ids.map(id=>roster.get(id));
      const player={key:'five:'+r.ids.join('-')+r.source,name:members.map(p=>p.name).join(' · '),team:r.team,members};
      const net=measure(100*(r.scored/r.off-r.allowed/r.def),'net rating',r);
      return {player,metrics:{'lineup-defense':measure(100*r.allowed/r.def,'DRtg',r),'lineup-net':net,...(situation?{[lineupId]:net}:{})}};
    });
  }
  return players.filter(p=>(s.scope!=='TEAM'||p.team===team.abbr)&&(!s.position||p.position===s.position)).map(player=>{
    const record=intelligence.players?.[player.nbaPlayerId]?.seasons?.[season];
    const count=Number(s.window);
    const stats=count?recentMetrics(record,season,s.scope==='TEAM'?team.abbr:null,count):record?.metrics||{};
    const metrics=Object.fromEntries(Object.entries(stats).filter(([,m])=>s.scope!=='TEAM'||!m.sourceTeam||m.sourceTeam===team.abbr));
    for(const key of ['steals','blocks','turnovers']){
      const total=metrics[key],games=metrics.games;
      if(total?.unit==='count'&&Number.isFinite(total.value)&&games?.value>0&&games.unit==='games'&&total.source===games.source&&total.sourceTeam===games.sourceTeam&&total.verifiedAt&&games.verifiedAt){
        metrics[key+'PerGame']={...total,value:total.value/games.value,unit:'per game',calculation:key+' divided by games played'};
      }
    }
    const contract=intelligence.contracts?.[player.nbaPlayerId]?.[s.year];
    if(contract?.source&&contract.verifiedAt){
      if(Number.isFinite(contract.cap))metrics.cap=measure(contract.cap,'USD',contract);
      for(const opt of ['player','team'])if(contract.optionType===opt)metrics[opt+'Option']=measure(1,'verified',contract);
      const end=Number(s.year.slice(0,4))+1;
      if(Number(contract.expirationYear)===end||String(contract.expirationDate||'').startsWith(end+'-')){
        metrics.expiring=measure(end,'expiration year',contract);
        if(/rookie/i.test(contract.contractType||''))metrics.rookieExpiry=metrics.expiring;
      }
      if(contract.extensionEligible===true&&contract.cbaCitation)metrics.extension=measure(1,'documented eligibility',contract);
    }
    const birth=intelligence.players?.[player.nbaPlayerId]?.physical?.birthDate;
    if(birth?.source&&birth.verifiedAt)metrics.age=measure(Math.floor((Date.UTC(parseInt(season),9,1)-Date.parse(birth.value))/31556952000),'years',birth);
    return {player,metrics};
  }).filter(r=>(!s.capMax||r.metrics.cap?.value<=+s.capMax)&&(!s.age||r.metrics.age?.value<+s.age));
}
export function sampleMetric(id,key) {
  let hash=2166136261;
  for(const c of id+'|'+key)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  return {value:(hash%10001)/100,unit:'demo pts',illustrative:true};
}
// Fixed-size cards occupy deterministic concentric rings. Each ring reserves
// a full card diagonal between neighbors and a separate radial band.
export function ringPositions(count){
  const points=[];let ring=0;
  while(points.length<count){
    const slots=5+6*ring, n=Math.min(count-points.length,slots);
    for(let i=0;i<n;i++){
      const angle=-Math.PI/2+i*2*Math.PI/slots+ring*.16;
      const radius=194+ring*208+i*3;
      points.push([Math.cos(angle)*radius,Math.sin(angle)*radius]);
    }
    ring++;
  }
  const diameter=ring<=1?630:Math.ceil(2*(Math.max(...points.map(p=>Math.hypot(...p)))+93));
  return {points,diameter};
}
