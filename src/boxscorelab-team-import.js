import crypto from 'node:crypto';
import {teams} from './data/teams.js';

const teamIds=new Set(teams.map(team=>team.abbr));
const number=(row,key)=>{const value=Number(row[key]);if(!Number.isFinite(value))throw Error(`Invalid ${key} for ${row.team}`);return value};
function csv(bytes,filename){
  const lines=bytes.toString('utf8').trim().split(/\r?\n/),header=lines.shift().split(',');
  const rows=lines.map((line,index)=>{const cells=line.split(',');if(cells.length!==header.length)throw Error(`${filename}:${index+2} has wrong column count`);return Object.fromEntries(header.map((key,i)=>[key,cells[i]]))});
  return {rows,sourceUrl:`https://boxscorelab.com/downloads/${filename}`,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
export function importTeamSeason(season,standingsBytes,gamesBytes,{verifiedAt='2026-11-16'}={}){
  if(!/^20\d{2}-\d{2}$/.test(season))throw Error('Invalid season');
  const standings=csv(standingsBytes,`${season}-team-standings.csv`),games=csv(gamesBytes,`${season}-team-game-results.csv`);
  if(standings.rows.length!==30||new Set(standings.rows.map(row=>row.team)).size!==30)throw Error(`Standings must contain 30 unique teams in ${season}`);
  const teamSeasons={},teamGames={};
  for(const row of standings.rows){
    if(row.season!==season||!teamIds.has(row.team))throw Error(`Unknown team or season: ${row.team}`);
    const wins=number(row,'wins'),losses=number(row,'losses'),gamesPlayed=number(row,'games');
    if(wins+losses!==gamesPlayed||Math.abs(wins/gamesPlayed-number(row,'win_pct'))>.001)throw Error(`Invalid record for ${row.team}`);
    teamSeasons[row.team]={season,team:row.team,wins,losses,games:gamesPlayed,pointsPerGame:number(row,'points_pg'),opponentPointsPerGame:number(row,'opponent_points_pg'),offRatingEstimated:number(row,'off_rating_est'),defRatingEstimated:number(row,'def_rating_est'),netRatingEstimated:number(row,'net_rating'),paceEstimated:number(row,'pace'),source:standings.sourceUrl,verifiedAt};
  }
  for(const row of games.rows){
    const year=Number(row.game_date.slice(0,4)),first=Number(season.slice(0,4));
    if(row.season!==season||!teamIds.has(row.team)||!teamIds.has(row.opponent)||!/^20\d{2}-\d\d-\d\d$/.test(row.game_date)||year<first||year>first+1)throw Error(`Invalid game identity for ${row.team}`);
    const points=number(row,'points'),opponentPoints=number(row,'opponent_points'),pointDiff=number(row,'point_diff');
    if(points-opponentPoints!==pointDiff||!['W','L'].includes(row.result)||((pointDiff>0)!==(row.result==='W')))throw Error(`Invalid score for ${row.team} on ${row.game_date}`);
    (teamGames[row.team]??=[]).push({date:row.game_date,opponent:row.opponent,home:row.home==='True',result:row.result,points,opponentPoints,pointDiff,rebounds:number(row,'rebounds'),assists:number(row,'assists'),source:games.sourceUrl,verifiedAt});
  }
  for(const [team,records] of Object.entries(teamGames)){
    records.sort((a,b)=>a.date.localeCompare(b.date));
    if(records.length!==teamSeasons[team].games||records.filter(game=>game.result==='W').length!==teamSeasons[team].wins)throw Error(`Game result count differs from standings for ${team}`);
  }
  return {season,teamSeasons,teamGames,sourceFiles:[standings,games].map(({sourceUrl,sha256,rows})=>({sourceUrl,sha256,rows:rows.length})),coverage:{teams:Object.keys(teamSeasons).length,teamGames:games.rows.length}};
}
