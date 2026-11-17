import fs from 'node:fs';
import path from 'node:path';
import {teams} from '../../src/data/teams.js';

const root=path.resolve(import.meta.dirname,'../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'src/data',name),'utf8'));
const roster=read('players.json').players;
const players=read('nba360-local.json').players;
const teamData=read('nba360-teams-local.json');
const seasons=['2022-23','2023-24','2024-25','2025-26','2026-27'];
const history=teamData.history||{[teamData.season]:{teamSeasons:teamData.teamSeasons,teamGames:teamData.teamGames}};
const playerCount=season=>Object.values(players).filter(record=>record.seasons?.[season]).length;
const teamCount=season=>Object.keys(history[season]?.teamSeasons||{}).length;
const gameCount=season=>Object.values(history[season]?.teamGames||{}).flat().length;
const byTeam=teams.map(team=>{
  const members=roster.filter(player=>player.team===team.abbr);
  const playerSeasons=seasons.map(season=>members.filter(player=>players[player.nbaPlayerId]?.seasons?.[season]).length);
  const teamGames=seasons.map(season=>history[season]?.teamGames?.[team.abbr]?.length||0);
  return [team.abbr,members.length,...playerSeasons,...teamGames];
});
const metricCounts=new Map;
for(const record of Object.values(players))for(const [season,data] of Object.entries(record.seasons||{}))for(const key of Object.keys(data.metrics||{})){
  const identity=`${season}:${key}`;
  metricCounts.set(identity,(metricCounts.get(identity)||0)+1);
}
const metricValues=[...metricCounts.values()].reduce((sum,value)=>sum+value,0);
const seasonRows=seasons.map(season=>`| ${season} | ${playerCount(season)} | ${teamCount(season)} | ${gameCount(season)} |`).join('\n');
const report=`# NBA 360 data coverage — November 16, 2026\n\nThis report reflects the local private BoxScore Lab snapshot, not a live NBA feed. Player season totals join to the existing roster by exact unique name; 2026–27 also requires a matching team. The 525 roster identities have not all been independently reverified against dated NBA.com rosters. Source files and SQLite data are Git ignored pending NBA-origin downstream rights review.\n\n- Roster snapshot: ${roster.length} players across 30 teams.\n- Unique players with at least one season: ${Object.keys(players).length}; ${roster.length-Object.keys(players).length} without a matched season.\n- Player seasons: ${seasons.reduce((sum,season)=>sum+playerCount(season),0)}; sourced metric values: ${metricValues}.\n- Team standings: ${seasons.reduce((sum,season)=>sum+teamCount(season),0)}; team game rows: ${seasons.reduce((sum,season)=>sum+gameCount(season),0)}. Each game appears once per participating team in these CSVs.\n- Player game logs, shot events, possessions, lineups, on/off rows, verified contracts, injuries and NBA tracking: **0** each. These are missing source records, not zero basketball outcomes.\n- Provenance: [BoxScore Lab downloads](https://boxscorelab.com/downloads/), CC BY 4.0 publication. Its [methodology](https://boxscorelab.com/methodology/) identifies NBA Stats upstream; [NBA terms](https://www.nba.com/termsofuse) restrict comprehensive regularly updated public databases without consent.\n\n## Coverage by season\n\n| Season | Current-roster players with season totals | Team standings | Team game rows |\n| --- | ---: | ---: | ---: |\n${seasonRows}\n\n## 30-team matrix\n\nPlayer-season columns count **current roster members** with a matched historical season, so a player's historic team may differ. Team-game columns count the team in each source season. Player box scores, shots, possessions, lineups, on/off, contracts, tracking and injuries remain zero for every team.\n\n| Team | Roster | 22–23 players | 23–24 players | 24–25 players | 25–26 players | 26–27 players | 22–23 games | 23–24 games | 24–25 games | 25–26 games | 26–27 games |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${byTeam.map(row=>`| ${row.join(' | ')} |`).join('\n')}\n\n## Metric values by season\n\nEvery populated field is BoxScore Lab reported except minutes per game, three-point attempt rate, and free-throw rate, calculated by Atlas from verified source totals. Estimated ratings retain source labels.\n\n| Season | Metric key | Values |\n| --- | --- | ---: |\n${[...metricCounts].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,value])=>`| ${key.split(':')[0]} | ${key.split(':')[1]} | ${value} |`).join('\n')}\n\n## Access status\n\n| Family | Status | Required next input |\n| --- | --- | --- |\n| Player season totals, team standings and team games | Local five-season snapshot | Review NBA-origin publication rights before public redistribution. |\n| Live scores | Connector ready, 0 BDL rows | Set a server-side BALLDONTLIE free API key; free plan is scores only. |\n| Player game trends | Import ready, 0 rows | Licensed dated player game-log CSV with NBA player and game IDs. |\n| Shot charts | Validated importer, 0 NBA events | Rights-cleared shot-event feed with exact IDs and coordinates. |\n| On/off and lineups | Calculator tested, 0 NBA possessions | Rights-cleared play-by-play, substitutions and possession reconstruction. |\n| Contracts and salary bars | Verified contract slots, 0 values | Authorized annual contract export with cap accounting and dates. |\n| Physical, age, scheme, tracking | Unavailable | Dated licensed measurements and provider records. |\n| Proprietary LEBRON, EPM, DARKO and zTS | Restricted or not derivable | Licensed provider results or complete validated independent model inputs. |\n`;
const output=path.join(root,'docs/nba360-coverage-2026-11-16.md');
fs.writeFileSync(output,report);
console.log(JSON.stringify({report:output,teams:byTeam.length,seasons:seasons.length,metricValues}));
