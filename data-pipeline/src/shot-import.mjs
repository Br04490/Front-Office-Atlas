import crypto from 'node:crypto';
import {validShot} from '../../src/shot-intelligence.js';

export function importShotEvents(db,payload,roster){
  if(payload?.rights?.authorizedForAtlas!==true||!payload.rights.basis||!/^https:\/\//.test(payload.rights.sourceUrl||''))throw Error('Shot import requires documented use rights and HTTPS source');
  if(!Array.isArray(payload.shotEvents))throw Error('shotEvents array required');
  const playerIds=new Set(roster.map(player=>player.nbaPlayerId));
  const select=db.prepare('SELECT source_url,loc_x,loc_y,made,shot_value FROM atlas_shot_events WHERE nba_player_id=? AND season=? AND game_id=? AND game_event_id=?');
  const insert=db.prepare(`INSERT INTO atlas_shot_events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(nba_player_id,season,game_id,game_event_id,source_url) DO UPDATE SET game_date=excluded.game_date,loc_x=excluded.loc_x,loc_y=excluded.loc_y,made=excluded.made,shot_value=excluded.shot_value,shot_distance=excluded.shot_distance,shot_type=excluded.shot_type,period=excluded.period,opponent_abbr=excluded.opponent_abbr,verified_at=excluded.verified_at,source_sha256=excluded.source_sha256`);
  const seen=new Set,sha256=crypto.createHash('sha256').update(JSON.stringify(payload.shotEvents)).digest('hex');
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const shot of payload.shotEvents){
      const key=`${shot.playerId}:${shot.season}:${shot.gameId}:${shot.gameEventId}`;
      if(!playerIds.has(Number(shot.playerId))||!validShot(shot,shot.playerId)||!/^20\d{2}-\d{2}$/.test(shot.season||'')||seen.has(key))throw Error(`Invalid or duplicate shot event ${key}`);
      seen.add(key);
      const prior=select.get(Number(shot.playerId),shot.season,shot.gameId,shot.gameEventId);
      if(prior&&(prior.source_url!==shot.source||prior.loc_x!==shot.locX||prior.loc_y!==shot.locY||prior.made!==Number(shot.made)||prior.shot_value!==shot.shotValue))throw Error(`Conflicting canonical shot event ${key}`);
      insert.run(Number(shot.playerId),shot.season,shot.gameId,shot.gameEventId,shot.date,shot.locX,shot.locY,Number(shot.made),shot.shotValue,shot.shotDistance??null,shot.shotType??null,shot.period??null,shot.opponent??null,shot.source,shot.verifiedAt,sha256);
    }
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return {shotEvents:payload.shotEvents.length,sourceSha256:sha256};
}
