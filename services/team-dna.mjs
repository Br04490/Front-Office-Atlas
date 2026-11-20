import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {defaultDatabase} from '../data-pipeline/src/warehouse.mjs';

const roster=JSON.parse(fs.readFileSync(new URL('../src/data/players.json',import.meta.url),'utf8')).players;
const rosterById=new Map(roster.map(player=>[String(player.nbaPlayerId),player]));
const send=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'}).end(JSON.stringify(data));

export function rankTeamDna(db,{season='2026-27',metrics=[],position='',minGames=0,minMinutes=0,search='',limit=25}={}){
 if(!/^20\d{2}-\d{2}$/.test(season)||!Array.isArray(metrics)||metrics.length<1||metrics.length>5)throw Error('Choose one to five metrics and a valid season');
 const available=new Set(db.prepare('SELECT DISTINCT metric_code FROM atlas_player_season_metrics WHERE season=?').all(season).map(row=>row.metric_code));
 if(metrics.some(row=>!available.has(row.code)||!Number.isFinite(row.weight)||row.weight<=0||!['high','low'].includes(row.direction)))throw Error('A metric, positive weight or direction is invalid');
 const fields=[...new Set([...metrics.map(row=>row.code),'games','minutes','threePointAttempts','fieldGoalAttempts'])];
 const placeholders=fields.map(()=>'?').join(',');
 const records=db.prepare(`SELECT nba_player_id,metric_code,value,unit,source_url,verified_at,sample FROM atlas_player_season_metrics WHERE season=? AND metric_code IN (${placeholders})`).all(season,...fields);
 const byPlayer=Map.groupBy(records,row=>row.nba_player_id);
 const eligible=[];
 for(const [id,items] of byPlayer){
  const player=rosterById.get(String(id));if(!player)continue;
  const map=new Map(items.map(row=>[row.metric_code,row]));
  if((map.get('games')?.value??0)<minGames||(map.get('minutes')?.value??0)<minMinutes||metrics.some(metric=>!map.has(metric.code)))continue;
  if(metrics.some(metric=>metric.code==='threePct')&&(map.get('threePointAttempts')?.value??0)<20)continue;
  if(metrics.some(metric=>metric.code==='fgPct')&&(map.get('fieldGoalAttempts')?.value??0)<40)continue;
  eligible.push({player,map});
 }
 if(eligible.length<2)throw Error('Too few fully sourced players for a stable reference population');
 const distributions=new Map(metrics.map(metric=>[metric.code,eligible.map(row=>row.map.get(metric.code).value).sort((a,b)=>a-b)]));
 const totalWeight=metrics.reduce((sum,row)=>sum+row.weight,0);
 const ranked=eligible.map(({player,map})=>{
  const evidence=metrics.map(metric=>{
   const value=map.get(metric.code).value,distribution=distributions.get(metric.code);
   const less=distribution.filter(n=>n<value).length,equal=distribution.filter(n=>n===value).length;
   const percentile=100*(less+equal/2)/distribution.length;
   const desirability=metric.direction==='low'?100-percentile:percentile;
   const source=map.get(metric.code);
   return {metric:metric.code,value,unit:source.unit,weight:metric.weight,direction:metric.direction,percentile:Number(desirability.toFixed(1)),sourceUrl:source.source_url,verifiedAt:source.verified_at,sample:source.sample,attempts:metric.code==='threePct'?map.get('threePointAttempts')?.value??null:metric.code==='fgPct'?map.get('fieldGoalAttempts')?.value??null:null};
  });
  return {nbaPlayerId:player.nbaPlayerId,name:player.name,team:player.team,position:player.position,score:Number((evidence.reduce((sum,item)=>sum+item.percentile*item.weight,0)/totalWeight).toFixed(1)),games:map.get('games')?.value??null,minutes:map.get('minutes')?.value??null,evidence};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 const filtered=ranked.filter(row=>(!position||row.position?.includes(position))&&(!search||`${row.name} ${row.team}`.toLowerCase().includes(search.toLowerCase())));
 return {season,referencePopulation:eligible.length,matched:filtered.length,results:filtered.slice(0,Math.min(100,Math.max(1,limit))),formula:'Weighted mean of each metric percentile across all fully sourced current-roster NBA players meeting sample thresholds; lower direction inverts percentile',metrics,limitations:['Three-point percentage requires at least 20 recorded season attempts; field-goal percentage requires 40.','A score does not establish trade availability, contract affordability, roster fit or medical status.','Source reuse rights require review before external publication.']};
}

export function teamDnaApi(req,res,url,filename=defaultDatabase){
 if(req.method!=='GET')return send(res,405,{error:'GET required'});
 if(url.pathname!=='/api/team-dna/rank')return send(res,404,{error:'Not found'});
 if(!fs.existsSync(filename))return send(res,503,{error:'Local warehouse missing'});
 const metrics=url.searchParams.getAll('metric').map(value=>{const [code,weight,direction]=value.split('|');return {code,weight:Number(weight),direction}});
 const minGames=Number(url.searchParams.get('minGames')||0),minMinutes=Number(url.searchParams.get('minMinutes')||0);
 if(!Number.isFinite(minGames)||minGames<0||!Number.isFinite(minMinutes)||minMinutes<0)return send(res,400,{error:'Invalid sample threshold'});
 const db=new DatabaseSync(filename,{readOnly:true});
 try{return send(res,200,rankTeamDna(db,{season:url.searchParams.get('season')||'2026-27',metrics,position:url.searchParams.get('position')||'',search:url.searchParams.get('search')||'',minGames,minMinutes,limit:Number(url.searchParams.get('limit')||25)}))}
 catch(error){return send(res,400,{error:error.message})}
 finally{db.close()}
}
