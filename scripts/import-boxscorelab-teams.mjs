import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {importTeamSeason} from '../src/boxscorelab-team-import.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceDir=path.join(root,'work/nba360-source');
const seasons=process.argv.slice(2).length?process.argv.slice(2):['2026-27'];
const history={},sourceFiles=[];
for(const season of seasons){
  const standings=fs.readFileSync(path.join(sourceDir,`${season}-team-standings.csv`));
  const games=fs.readFileSync(path.join(sourceDir,`${season}-team-game-results.csv`));
  const result=importTeamSeason(season,standings,games);
  if(history[season])throw Error(`Duplicate season ${season}`);
  history[season]={teamSeasons:result.teamSeasons,teamGames:result.teamGames};
  sourceFiles.push(...result.sourceFiles);
}
if(!history['2026-27'])throw Error('Current 2026-27 season is required for the existing team views');
const current=history['2026-27'];
const output={schemaVersion:1,season:'2026-27',source:'BoxScore Lab CC BY 4.0; private local snapshot; NBA-origin downstream rights need review',sourceFiles,teamSeasons:current.teamSeasons,teamGames:current.teamGames,history};
const destination=path.join(root,'src/data/nba360-teams-local.json'),temporary=`${destination}.${process.pid}.tmp`;
try{fs.writeFileSync(temporary,JSON.stringify(output,null,2)+'\n');fs.renameSync(temporary,destination)}finally{if(fs.existsSync(temporary))fs.rmSync(temporary)}
console.log(JSON.stringify({seasons:seasons.map(season=>({season,teams:Object.keys(history[season].teamSeasons).length,teamGames:Object.values(history[season].teamGames).flat().length})),sourceFiles:sourceFiles.length},null,2));
