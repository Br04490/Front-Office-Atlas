import {openWarehouse,defaultDatabase} from '../src/warehouse.mjs';
const db=openWarehouse(process.env.ATLAS_DB_PATH||defaultDatabase);
try{
 const teams=db.prepare(`SELECT t.pool,t.official_name,t.season,t.official_roster_count,t.roster_completeness,t.verified_at,t.source_url,
 COUNT(DISTINCT m.player_key) AS loaded_players,COUNT(DISTINCT c.coach_name) AS head_coaches
 FROM atlas_external_teams t LEFT JOIN atlas_external_memberships m ON m.pool=t.pool AND m.source_provider=t.source_provider AND m.provider_team_id=t.provider_team_id AND m.season=t.season
 LEFT JOIN atlas_external_coaches c ON c.pool=t.pool AND c.source_provider=t.source_provider AND c.provider_team_id=t.provider_team_id AND c.season=t.season
 GROUP BY t.pool,t.source_provider,t.provider_team_id,t.season ORDER BY t.pool,t.official_name`).all();
 const conflicts=db.prepare(`SELECT pool,source_provider,provider_player_id,season,COUNT(DISTINCT team_id) AS teams
 FROM atlas_external_players GROUP BY pool,source_provider,provider_player_id,season HAVING COUNT(DISTINCT team_id)>1`).all();
 const missingBios=db.prepare(`SELECT COUNT(*) AS n FROM atlas_external_memberships m LEFT JOIN atlas_external_player_bio b ON b.player_key=m.player_key WHERE b.player_key IS NULL`).get().n;
 const report={verifiedAt:new Date().toISOString().slice(0,10),teams,totals:{teams:teams.length,players:teams.reduce((n,t)=>n+t.loaded_players,0),headCoaches:teams.reduce((n,t)=>n+t.head_coaches,0),completeRosters:teams.filter(t=>t.loaded_players===t.official_roster_count&&t.loaded_players>0).length,missingBios,identityConflicts:conflicts.length},conflicts};
 console.log(JSON.stringify(report,null,2));
 if(teams.some(t=>t.loaded_players!==t.official_roster_count)||missingBios||conflicts.length)process.exitCode=1;
}finally{db.close()}
