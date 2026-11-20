import test from 'node:test';
import assert from 'node:assert/strict';
import {teamHealthData,teamHealthPanel} from '../src/nba360-team-views.js';

test('team health ranks lower opponent scoring higher with a stable 30-team population',()=>{
 const teamSeasons={};
 for(let i=0;i<30;i++)teamSeasons[`T${i}`]={team:`T${i}`,season:'2026-27',games:12,pointsPerGame:130-i,opponentPointsPerGame:100+i,source:'https://example.org/teams.csv',verifiedAt:'2026-11-19'};
 const teamGames={T0:Array.from({length:8},(_,i)=>({pointDiff:i-3,source:'https://example.org/games.csv',verifiedAt:'2026-11-19'}))};
 const snapshot={teamSeasons,teamGames};
 const result=teamHealthData(snapshot,'T0');
 assert.deepEqual(result.metrics.map(metric=>metric.rank),[1,1]);
 assert.equal(result.metrics[1].lowerIsBetter,true);
 assert.equal(result.metrics[0].percentile,100);
 assert.equal(result.last8.averageMargin,.5);
 assert.match(teamHealthPanel(snapshot,'T0'),/Pending inputs: Shooting efficiency/);
 assert.equal(teamHealthData({teamSeasons:{T0:teamSeasons.T0}},'T0'),null);
});
