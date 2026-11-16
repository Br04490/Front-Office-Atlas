import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {teams} from '../src/data/teams.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceDir=path.join(root,'work/nba360-source');
const season='2026-27';
const sourceName=name=>`${season}-${name}.csv`;
function csv(name){
  const filename=sourceName(name),bytes=fs.readFileSync(path.join(sourceDir,filename));
  const lines=bytes.toString('utf8').trim().split(/\r?\n/);
  const header=lines.shift().split(',');
  const rows=lines.map((line,index)=>{
    const cells=line.split(',');
    if(cells.length!==header.length)throw Error(`${filename}:${index+2} has wrong column count`);
    return Object.fromEntries(header.map((key,i)=>[key,cells[i]]));
  });
  return {rows,sourceUrl:`https://boxscorelab.com/downloads/${filename}`,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
const standings=csv('team-standings'),games=csv('team-game-results');
const teamIds=new Set(teams.map(team=>team.abbr));
const number=(row,key)=>{const value=Number(row[key]);if(!Number.isFinite(value))throw Error(`Invalid ${key} for ${row.team}`);return value};
if(standings.rows.length!==30||new Set(standings.rows.map(row=>row.team)).size!==30)throw Error('Standings must contain 30 unique teams');
const teamSeasons={};
for(const row of standings.rows){
  if(row.season!==season||!teamIds.has(row.team))throw Error(`Unknown team or season: ${row.team}`);
  const wins=number(row,'wins'),losses=number(row,'losses'),gamesPlayed=number(row,'games');
  if(wins+losses!==gamesPlayed||Math.abs(wins/gamesPlayed-number(row,'win_pct'))>.001)throw Error(`Invalid record for ${row.team}`);
  teamSeasons[row.team]={season,team:row.team,wins,losses,games:gamesPlayed,pointsPerGame:number(row,'points_pg'),opponentPointsPerGame:number(row,'opponent_points_pg'),offRatingEstimated:number(row,'off_rating_est'),defRatingEstimated:number(row,'def_rating_est'),netRatingEstimated:number(row,'net_rating'),paceEstimated:number(row,'pace'),source:standings.sourceUrl,verifiedAt:'2026-11-16'};
}
const teamGames={};
for(const row of games.rows){
  if(row.season!==season||!teamIds.has(row.team)||!teamIds.has(row.opponent)||!/^2026-\d\d-\d\d$/.test(row.game_date))throw Error(`Invalid game identity for ${row.team}`);
  const points=number(row,'points'),opponentPoints=number(row,'opponent_points'),pointDiff=number(row,'point_diff');
  if(points-opponentPoints!==pointDiff||!['W','L'].includes(row.result)||((pointDiff>0)!==(row.result==='W')))throw Error(`Invalid score for ${row.team} on ${row.game_date}`);
  (teamGames[row.team]??=[]).push({date:row.game_date,opponent:row.opponent,home:row.home==='True',result:row.result,points,opponentPoints,pointDiff,rebounds:number(row,'rebounds'),assists:number(row,'assists'),source:games.sourceUrl,verifiedAt:'2026-11-16'});
}
for(const [team,records] of Object.entries(teamGames)){
  records.sort((a,b)=>a.date.localeCompare(b.date));
  if(records.length!==teamSeasons[team].games)throw Error(`Game count differs from standings for ${team}`);
  if(records.filter(game=>game.result==='W').length!==teamSeasons[team].wins)throw Error(`Win count differs for ${team}`);
}
const destination=path.join(root,'src/data/nba360-teams-local.json');
const output={schemaVersion:1,season,source:'BoxScore Lab CC BY 4.0; private local snapshot; NBA-origin downstream rights need review',sourceFiles:[standings,games].map(({sourceUrl,sha256,rows})=>({sourceUrl,sha256,rows:rows.length})),teamSeasons,teamGames};
const temporary=`${destination}.${process.pid}.tmp`;
try{fs.writeFileSync(temporary,JSON.stringify(output,null,2)+'\n');fs.renameSync(temporary,destination)}finally{if(fs.existsSync(temporary))fs.rmSync(temporary)}
console.log(JSON.stringify({teams:Object.keys(teamSeasons).length,teamGames:games.rows.length,sourceFiles:output.sourceFiles},null,2));
