import {teams} from '../../src/data/teams.js';
const known=new Set(teams.map(team=>team.abbr));
const dayInChicago=date=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
const recentDates=now=>{const dates=[];for(let delta=0;delta<2;delta++)dates.push(dayInChicago(new Date(now.getTime()-delta*86400000)));return dates};
const finalState=game=>String(game.status||'').toLowerCase().startsWith('final')||game.status_state==='final';
export async function pollBdlScores(db,{apiKey,fetcher=fetch,now=new Date()}={}){
  if(!apiKey)return {status:'awaiting_key',gamesFetched:0,newFinalGames:[]};
  const params=new URLSearchParams({per_page:'100'});
  for(const date of recentDates(now))params.append('dates[]',date);
  const sourceUrl=`https://api.balldontlie.io/v1/games?${params}`;
  const response=await fetcher(sourceUrl,{headers:{Authorization:apiKey,Accept:'application/json'}});
  if(!response.ok)throw Error(`BALLDONTLIE HTTP ${response.status}; check API key, tier or rate limit`);
  const payload=await response.json();
  if(!Array.isArray(payload.data)||payload.meta?.next_cursor)throw Error('Unexpected or paginated BDL game response; no partial import');
  const rows=payload.data,newFinalGames=[];
  const find=db.prepare('SELECT status FROM atlas_bdl_games WHERE bdl_game_id=?');
  const upsert=db.prepare(`INSERT INTO atlas_bdl_games VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(bdl_game_id) DO UPDATE SET game_date=excluded.game_date,season_start_year=excluded.season_start_year,home_team_abbr=excluded.home_team_abbr,away_team_abbr=excluded.away_team_abbr,home_score=excluded.home_score,away_score=excluded.away_score,status=excluded.status,provider_updated_at=excluded.provider_updated_at,fetched_at=excluded.fetched_at`);
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const game of rows){
      const home=game.home_team?.abbreviation,away=game.visitor_team?.abbreviation;
      if(!Number.isInteger(game.id)||!/^\d{4}-\d{2}-\d{2}$/.test(game.date)||!known.has(home)||!known.has(away))throw Error(`Invalid BDL game identity ${game.id}`);
      const status=finalState(game)?'final':String(game.status_state||'scheduled');
      const previous=find.get(game.id);
      if(status==='final'&&previous?.status!=='final')newFinalGames.push(game.id);
      upsert.run(game.id,game.date,Number(game.season)||null,home,away,game.home_team_score??null,game.visitor_team_score??null,status,game.updated_at||null,now.toISOString(),'https://docs.balldontlie.io/');
    }
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return {status:'synced',gamesFetched:rows.length,newFinalGames,asOf:now.toISOString(),scope:'scores only; no player box scores, shots or possessions'};
}
