import test from 'node:test';
import assert from 'node:assert/strict';
import {teams} from '../src/data/teams.js';
import {importTeamSeason} from '../src/boxscorelab-team-import.js';

const standingsHeader='season,team,team_name,wins,losses,win_pct,games,points_pg,opponent_points_pg,off_rating_est,def_rating_est,net_rating,sos,adjusted_net_rating,pace';
const gamesHeader='season,team,game_date,matchup,opponent,home,result,points,opponent_points,point_diff,field_goals_made,field_goal_attempts,field_goal_pct,three_point_makes,three_point_attempts,three_point_pct,free_throws_made,free_throw_attempts,offensive_rebounds,defensive_rebounds,rebounds,assists,steals,blocks,turnovers,effective_fg_pct,off_rating_est,def_rating_est';
const standings=[standingsHeader,...teams.map(team=>`2025-26,${team.abbr},${team.name},1,0,1,1,110,100,110,100,10,0,10,100`)].join('\n');
const games=[gamesHeader,...teams.map((team,i)=>`2025-26,${team.abbr},2025-11-15,${team.abbr} vs. ${teams[(i+1)%30].abbr},${teams[(i+1)%30].abbr},True,W,110,100,10,40,80,0.5,10,25,0.4,20,25,10,30,40,25,5,2,10,0.56,110,100`)].join('\n');
test('historical team source validates 30 standings and dated game scores',()=>{
  const result=importTeamSeason('2025-26',Buffer.from(standings),Buffer.from(games));
  assert.equal(Object.keys(result.teamSeasons).length,30);
  assert.equal(Object.values(result.teamGames).flat().length,30);
  assert.equal(result.teamGames.HOU[0].pointDiff,10);
  assert.throws(()=>importTeamSeason('2025-26',Buffer.from(standings),Buffer.from(games.replace('110,100,10','110,100,11'))),/Invalid score/);
});
