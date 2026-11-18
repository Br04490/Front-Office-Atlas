export function phase1Coverage(db,season='2026-27'){
 const result={};
 for(const pool of ['NCAA_D1','G_LEAGUE']){
  const teams=db.prepare('SELECT COUNT(*) AS total,COUNT(DISTINCT conference) AS conferences,COUNT(DISTINCT campus_region) AS regions,SUM(roster_completeness=\'complete\') AS completeRosters FROM atlas_external_teams WHERE pool=? AND season=?').get(pool,season);
  const coaches=db.prepare('SELECT COUNT(*) AS total FROM atlas_external_coaches WHERE pool=? AND season=?').get(pool,season).total;
  const members=db.prepare('SELECT COUNT(DISTINCT player_key) AS total FROM atlas_external_memberships WHERE pool=? AND season=?').get(pool,season).total;
  const photos=db.prepare("SELECT COUNT(DISTINCT m.player_key) AS total FROM atlas_external_memberships m JOIN atlas_external_player_bio b ON b.player_key=m.player_key WHERE m.pool=? AND m.season=? AND b.photo_status='approved' AND b.photo_url IS NOT NULL").get(pool,season).total;
  const statistics=db.prepare('SELECT COUNT(DISTINCT m.player_key) AS total FROM atlas_external_memberships m JOIN atlas_external_player_metrics s ON s.player_key=m.player_key AND s.season=m.season WHERE m.pool=? AND m.season=?').get(pool,season).total;
  result[pool]={teams:teams.total,conferences:teams.conferences,regions:teams.regions,coaches,completeRosters:teams.completeRosters||0,players:members,approvedPhotos:photos,playersWithStats:statistics};
 }
 return result;
}
