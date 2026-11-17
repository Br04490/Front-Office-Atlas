import crypto from 'node:crypto';
import {teams} from '../../src/data/teams.js';
const knownTeams=new Set(teams.map(team=>team.abbr));
export function importPossessions(db,payload,roster){
  if(payload?.rights?.authorizedForAtlas!==true||!payload.rights.basis||!/^https:\/\//.test(payload.rights.sourceUrl||''))throw Error('Possession import requires documented use rights');
  if(!Array.isArray(payload.possessions))throw Error('Possessions array required');
  const knownPlayers=new Set(roster.map(player=>player.nbaPlayerId)),seen=new Set;
  const sha256=crypto.createHash('sha256').update(JSON.stringify(payload.possessions)).digest('hex');
  const existing=db.prepare('SELECT source_url FROM atlas_possessions WHERE game_id=? AND possession_id=? AND team_abbr=?');
  const insert=db.prepare(`INSERT INTO atlas_possessions VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(game_id,possession_id,team_abbr,source_url) DO UPDATE SET side=excluded.side,points=excluded.points,on_court_player_ids=excluded.on_court_player_ids,verified_at=excluded.verified_at,source_sha256=excluded.source_sha256`);
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const p of payload.possessions){
      const key=`${p.gameId}:${p.possessionId}:${p.team}`;
      if(!/^\d{10}$/.test(p.gameId||'')||!Number.isInteger(p.possessionId)||p.possessionId<0||!/^20\d{2}-\d{2}$/.test(p.season||'')||!knownTeams.has(p.team)||!['offense','defense'].includes(p.side)||!Number.isInteger(p.points)||p.points<0||p.points>4||!Array.isArray(p.onCourtPlayerIds)||p.onCourtPlayerIds.length!==5||new Set(p.onCourtPlayerIds).size!==5||!p.onCourtPlayerIds.every(id=>knownPlayers.has(id))||!/^https:\/\//.test(p.source||'')||!/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedAt||'')||seen.has(key))throw Error(`Invalid or duplicate possession ${key}`);
      seen.add(key);
      const prior=existing.get(p.gameId,p.possessionId,p.team);
      if(prior&&prior.source_url!==p.source)throw Error(`Conflicting source for canonical possession ${key}`);
      insert.run(p.gameId,p.possessionId,p.season,p.team,p.side,p.points,JSON.stringify(p.onCourtPlayerIds),p.source,p.verifiedAt,sha256);
    }
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return {possessions:payload.possessions.length,sourceSha256:sha256};
}
