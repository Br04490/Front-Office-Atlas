import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {defaultDatabase} from '../data-pipeline/src/warehouse.mjs';

const send=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'}).end(JSON.stringify(data));
const bounded=(value,fallback,max)=>Math.min(max,Math.max(0,value!==null&&value!==''&&Number.isInteger(Number(value))?Number(value):fallback));
export function foundationApi(req,res,url,filename=defaultDatabase){
 if(req.method!=='GET')return send(res,405,{error:'GET required'});
 if(!fs.existsSync(filename))return send(res,503,{error:'Local warehouse missing'});
 const db=new DatabaseSync(filename,{readOnly:true});
 try{
  const league=url.searchParams.get('league')||'NCAA_D1';
  if(!['NCAA_D1','GRASSROOTS_BOYS','OVERSEAS_MEN'].includes(league))return send(res,400,{error:'Unsupported league'});
  if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='atlas_foundation_memberships'").get())return send(res,503,{error:'Foundation schema missing'});
  if(url.pathname==='/api/foundation/coverage'){
   const teams=db.prepare("SELECT COUNT(*) n FROM atlas_foundation_teams WHERE league=? AND season='2026-27'").get(league).n;
   const players=db.prepare("SELECT COUNT(*) n FROM atlas_foundation_memberships WHERE league=? AND season='2026-27'").get(league).n;
   const metrics=db.prepare("SELECT COUNT(*) n FROM atlas_foundation_metrics WHERE league=? AND season='2026-27'").get(league).n;
   return send(res,200,{league,season:'2026-27',teams,players,metrics,sourceStatus:league==='NCAA_D1'?'provider_reported_local_internal_rights_review':'user_supplied_unverified',sources:db.prepare('SELECT source_key,source_url,source_sha256,fetched_at,row_count,rights_status FROM atlas_foundation_sources ORDER BY source_key').all()});
  }
  if(url.pathname==='/api/foundation/players'){
   const filters=['m.league=?',"m.season='2026-27'"] ,args=[league];
   const text=url.searchParams.get('q')?.trim();if(text){filters.push('p.display_name LIKE ?');args.push(`%${text}%`)}
   const team=url.searchParams.get('team');if(team){filters.push('m.provider_team_id=?');args.push(team)}
   const position=url.searchParams.get('position');if(position){filters.push('m.position=?');args.push(position)}
   const sourceId=url.searchParams.get('sourceId');if(sourceId){filters.push('EXISTS (SELECT 1 FROM atlas_foundation_source_ids sid WHERE sid.atlas_person_id=m.atlas_person_id AND sid.provider_player_id=?)');args.push(sourceId)}
   const conditions=url.searchParams.getAll('filter');if(conditions.length>8)return send(res,400,{error:'At most eight metric filters are supported'});
   for(const condition of conditions){const [code,operator,raw]=condition.split('|');const value=Number(raw),sign={gte:'>=',lte:'<=',eq:'='}[operator];if(!code||!sign||!Number.isFinite(value))return send(res,400,{error:'Use filter=metric_code|gte/lte/eq|number'});filters.push(`EXISTS (SELECT 1 FROM atlas_foundation_metrics f WHERE f.atlas_person_id=m.atlas_person_id AND f.metric_code=? AND f.metric_value${sign}?)`);args.push(code,value)}
   const metric=url.searchParams.get('metric');if(metric){filters.push('EXISTS (SELECT 1 FROM atlas_foundation_metrics x WHERE x.atlas_person_id=m.atlas_person_id AND x.metric_code=?'+(url.searchParams.has('min')?' AND x.metric_value>=?':'')+(url.searchParams.has('max')?' AND x.metric_value<=?':'')+')');args.push(metric);for(const key of ['min','max'])if(url.searchParams.has(key)){const value=Number(url.searchParams.get(key));if(!Number.isFinite(value))return send(res,400,{error:`Invalid ${key}`});args.push(value)}}
   const where=filters.join(' AND '),limit=bounded(url.searchParams.get('limit'),50,200),offset=bounded(url.searchParams.get('offset'),0,100000);
   const total=db.prepare(`SELECT COUNT(*) n FROM atlas_foundation_memberships m JOIN atlas_foundation_people p USING(atlas_person_id) WHERE ${where}`).get(...args).n;
   const rows=db.prepare(`SELECT m.atlas_person_id,p.display_name,m.provider_team_id,t.display_name AS team_name,t.conference,m.jersey,m.position,m.roster_status,m.source_url,m.updated_at FROM atlas_foundation_memberships m JOIN atlas_foundation_people p USING(atlas_person_id) JOIN atlas_foundation_teams t ON t.league=m.league AND t.season=m.season AND t.provider=m.provider AND t.provider_team_id=m.provider_team_id WHERE ${where} ORDER BY p.display_name,m.atlas_person_id LIMIT ? OFFSET ?`).all(...args,limit,offset);
   return send(res,200,{total,limit,offset,rows,sourceStatus:league==='NCAA_D1'?'provider_reported; official school roster validation pending':'user_supplied; source identity and current status unverified'});
  }
  if(url.pathname==='/api/foundation/metrics'){
   const person=url.searchParams.get('person');if(!person)return send(res,400,{error:'person is required'});
   const rows=db.prepare("SELECT metric_code,metric_value,unit,metric_definition,calculation_method,source_url,updated_at FROM atlas_foundation_metrics WHERE atlas_person_id=? AND league=? AND season='2026-27' ORDER BY metric_code").all(person,league);
   return send(res,200,{atlasPersonId:person,league,season:'2026-27',rows});
  }
  return send(res,404,{error:'Not found'});
 }catch(error){return send(res,500,{error:'Foundation query failed',detail:error.message})}finally{db.close()}
}
