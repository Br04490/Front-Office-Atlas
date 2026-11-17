import crypto from 'node:crypto';
import {teams} from '../../src/data/teams.js';

export const gameLogColumns=['nba_player_id','game_id','game_date','season','team','opponent','season_type','minutes','points','rebounds','assists','fgm','fga','three_made','three_attempts','ftm','fta','turnovers','steals','blocks'];
const teamIds=new Set(teams.map(team=>team.abbr));
export function parseCsv(text,requiredColumns=gameLogColumns){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
    else if(char===','&&!quoted){row.push(field);field=''}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field=''}
    else field+=char;
  }
  if(quoted)throw Error('Unclosed CSV quote');
  if(row.length||field){row.push(field);rows.push(row)}
  const header=rows.shift();
  if(!header||requiredColumns.some(column=>!header.includes(column)))throw Error('Missing required CSV columns');
  return rows.map((cells,index)=>{if(cells.length!==header.length)throw Error(`CSV row ${index+2} has wrong column count`);return Object.fromEntries(header.map((name,i)=>[name,cells[i]]))});
}
export function importGameLogs(db,csv,{sourceUrl,verifiedAt,authorizedForAtlas,rightsBasis,roster}){
  if(authorizedForAtlas!==true||!rightsBasis||!/^https:\/\//.test(sourceUrl||''))throw Error('Authorized HTTPS game-log source and rights basis required');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(verifiedAt||''))throw Error('Verification date required');
  const rosterIds=new Set(roster.map(player=>player.nbaPlayerId));
  const rows=parseCsv(csv),sha256=crypto.createHash('sha256').update(csv).digest('hex');
  const seen=new Set;
  const insert=db.prepare(`INSERT INTO atlas_player_game_logs VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(nba_player_id,game_id,source_url) DO UPDATE SET game_date=excluded.game_date,season=excluded.season,team_abbr=excluded.team_abbr,opponent_abbr=excluded.opponent_abbr,season_type=excluded.season_type,minutes=excluded.minutes,points=excluded.points,rebounds=excluded.rebounds,assists=excluded.assists,fgm=excluded.fgm,fga=excluded.fga,three_made=excluded.three_made,three_attempts=excluded.three_attempts,ftm=excluded.ftm,fta=excluded.fta,turnovers=excluded.turnovers,steals=excluded.steals,blocks=excluded.blocks,ts_pct=excluded.ts_pct,efg_pct=excluded.efg_pct,verified_at=excluded.verified_at,source_sha256=excluded.source_sha256`);
  const val=(row,key)=>{if(row[key]==='')return null;const number=Number(row[key]);if(!Number.isFinite(number)||number<0)throw Error(`Invalid ${key} for ${row.game_id}`);return number};
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const row of rows){
      const id=Number(row.nba_player_id),key=`${id}:${row.game_id}`;
      if(!rosterIds.has(id)||!/^\d{10}$/.test(row.game_id)||!/^\d{4}-\d{2}-\d{2}$/.test(row.game_date)||!/^20\d{2}-\d{2}$/.test(row.season)||!teamIds.has(row.team)||!teamIds.has(row.opponent)||!['Regular Season','Playoffs'].includes(row.season_type)||seen.has(key))throw Error(`Invalid game identity ${key}`);
      seen.add(key);
      const points=val(row,'points'),fgm=val(row,'fgm'),fga=val(row,'fga'),three=val(row,'three_made'),threeAttempts=val(row,'three_attempts'),ftm=val(row,'ftm'),fta=val(row,'fta');
      if((fgm!=null&&fga!=null&&fgm>fga)||(three!=null&&fgm!=null&&three>fgm)||(three!=null&&threeAttempts!=null&&three>threeAttempts)||(ftm!=null&&fta!=null&&ftm>fta)||(points!=null&&fgm!=null&&three!=null&&ftm!=null&&points!==2*fgm+three+ftm))throw Error(`Inconsistent box score for ${key}`);
      const ts=points!=null&&fga!=null&&fta!=null&&fga+.44*fta>0?points/(2*(fga+.44*fta)):null;
      const efg=fgm!=null&&three!=null&&fga>0?(fgm+.5*three)/fga:null;
      insert.run(id,row.game_id,row.game_date,row.season,row.team,row.opponent,row.season_type,...['minutes','points','rebounds','assists','fgm','fga','three_made','three_attempts','ftm','fta','turnovers','steals','blocks'].map(key=>val(row,key)),ts,efg,sourceUrl,verifiedAt,sha256);
    }
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return {rows:rows.length,sourceUrl,sha256};
}
