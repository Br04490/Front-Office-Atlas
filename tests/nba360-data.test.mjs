import test from 'node:test';
import assert from 'node:assert/strict';
import {importSeasonTotals} from '../src/boxscorelab-import.js';
import {queryNbaMetrics} from '../src/nba360-metric-query.js';
import {teamTrendData,renderTeamGames} from '../src/nba360-team-views.js';

const roster=[{name:'Test Player',nbaPlayerId:123,team:'HOU'}];
const csv='season,player_name,team,games_played,minutes,points,rebounds,assists,field_goals_made,field_goal_attempts,three_point_makes,three_point_attempts,free_throws_made,free_throw_attempts,points_pg,effective_fg_pct,ts_pct\n2026-27,Test Player,HOU,2,60,10,8,4,4,10,1,4,1,2,5,0.45,0.4596\n';
test('season importer validates source totals and binds exact roster ID',()=>{
  const result=importSeasonTotals(csv,roster,{sourceUrl:'https://example.test/totals.csv'});
  assert.equal(result.coverage.matchedSeasons,1);
  assert.equal(result.players[123].seasons['2026-27'].metrics.points.value,5);
  assert.equal(result.players[123].seasons['2026-27'].metrics.minutes.value,30);
  assert.throws(()=>importSeasonTotals(csv.replace(',10,8,4,4,10,',',11,8,4,4,10,'),roster,{sourceUrl:'https://example.test/totals.csv'}),/Invalid basketball totals/);
  assert.equal(importSeasonTotals(csv.replace(',HOU,2,',',LAL,2,'),roster,{sourceUrl:'https://example.test/totals.csv'}).coverage.conflicts.length,1);
});
test('metric queries use populated values and report missing seasons',()=>{
  const intelligence=importSeasonTotals(csv,roster,{sourceUrl:'https://example.test/totals.csv'});
  const teams=[{abbr:'HOU',name:'Houston Rockets'}];
  const matched=queryNbaMetrics('players on Houston Rockets with at least 5 points in 2026-27',roster,teams,intelligence);
  assert.equal(matched.players[0].nbaPlayerId,123);
  assert.equal(matched.metricRows[0].value,5);
  assert.equal(queryNbaMetrics('players over 10 points in 2026-27',roster,teams,intelligence).players.length,0);
  assert.equal(queryNbaMetrics('players over 5 points in 2025-26',roster,teams,intelligence).status,'insufficient_data');
});
test('team trend and games render only source records',()=>{
  const snapshot={teamSeasons:{HOU:{wins:1,losses:1,games:2,offRatingEstimated:110,defRatingEstimated:108,netRatingEstimated:2,verifiedAt:'2026-11-16',source:'https://example.test/standings'}},teamGames:{HOU:[{date:'2026-11-01',opponent:'DAL',home:true,result:'W',points:110,opponentPoints:100,pointDiff:10,source:'https://example.test/games'},{date:'2026-11-03',opponent:'SAS',home:false,result:'L',points:90,opponentPoints:95,pointDiff:-5,source:'https://example.test/games'}]}};
  assert.equal(teamTrendData(snapshot,'HOU',2).rollingMargin,2.5);
  assert.equal(teamTrendData(snapshot,'BOS',2),null);
  assert.match(renderTeamGames(snapshot,'HOU').table,/2026-11-03/);
});
