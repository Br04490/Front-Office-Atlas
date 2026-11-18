import {teams} from '../../src/data/teams.js';

export function contractCoverage(db,roster,season){
 if(!/^20\d{2}-\d{2}$/.test(season))throw Error('Valid NBA season required');
 const rows=db.prepare('SELECT nba_player_id,team_abbr,cap_hit_usd,source_url,verified_at FROM atlas_contract_years WHERE season=?').all(season);
 const byId=new Map;
 const conflicts=[];
 for(const row of rows){const existing=byId.get(row.nba_player_id);if(existing)conflicts.push({nbaPlayerId:row.nba_player_id,sources:[existing.source_url,row.source_url]});else byId.set(row.nba_player_id,row)}
 const byTeam=teams.map(team=>{
  const members=roster.filter(player=>player.team===team.abbr),missing=[],mismatch=[];let priced=0,knownCapSubtotal=0;
  for(const player of members){const record=byId.get(player.nbaPlayerId);if(!record||record.cap_hit_usd===null){missing.push(player.nbaPlayerId);continue}if(record.team_abbr!==team.abbr){mismatch.push(player.nbaPlayerId);continue}priced++;knownCapSubtotal+=record.cap_hit_usd}
  return {team:team.abbr,rosterPlayers:members.length,pricedPlayers:priced,missingPlayerIds:missing,teamMismatchIds:mismatch,knownPlayerCapSubtotal:knownCapSubtotal,completePlayerCharges:missing.length===0&&mismatch.length===0};
 });
 return {season,rosterPlayers:roster.length,contractRows:rows.length,pricedPlayers:byTeam.reduce((sum,item)=>sum+item.pricedPlayers,0),teams:byTeam,conflicts,teamSalaryComplete:false,note:'Player charges alone do not certify non-player allocations, tax salary or official cap position.'};
}
