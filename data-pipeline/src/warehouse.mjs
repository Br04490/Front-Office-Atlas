import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {calculateOnOff} from '../../src/onoff-calculator.js';

export const defaultDatabase=path.resolve('data-pipeline/data/atlas-crystal.sqlite3');
const schema=fs.readFileSync(new URL('../schemas/atlas_extension.sql',import.meta.url),'utf8');
export function openWarehouse(filename=defaultDatabase){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const db=new DatabaseSync(filename);
  db.exec(schema);
  return db;
}
const assert=(condition,message)=>{if(!condition)throw Error(message)};
export function importSnapshots(db,playerData,teamData){
  assert(playerData?.schemaVersion===1&&teamData?.schemaVersion===1,'Snapshot schema mismatch');
  assert(playerData?.rights?.authorizedForAtlas===true,'Player snapshot lacks local use authorization');
  assert(Object.keys(teamData.teamSeasons||{}).length===30,'Expected 30 team standings');
  const insertMetric=db.prepare(`INSERT INTO atlas_player_season_metrics VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(nba_player_id,season,metric_code,source_url) DO UPDATE SET value=excluded.value,unit=excluded.unit,source_field=excluded.source_field,source_team=excluded.source_team,kind=excluded.kind,verified_at=excluded.verified_at,sample=excluded.sample`);
  const insertStanding=db.prepare(`INSERT INTO atlas_team_seasons VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(team_abbr,season,source_url) DO UPDATE SET wins=excluded.wins,losses=excluded.losses,games=excluded.games,points_per_game=excluded.points_per_game,opponent_points_per_game=excluded.opponent_points_per_game,off_rating_est=excluded.off_rating_est,def_rating_est=excluded.def_rating_est,net_rating_est=excluded.net_rating_est,pace_est=excluded.pace_est,verified_at=excluded.verified_at`);
  const insertGame=db.prepare(`INSERT INTO atlas_team_games VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(team_abbr,season,game_date,opponent_abbr,source_url) DO UPDATE SET home=excluded.home,result=excluded.result,points=excluded.points,opponent_points=excluded.opponent_points,point_diff=excluded.point_diff,rebounds=excluded.rebounds,assists=excluded.assists,verified_at=excluded.verified_at`);
  const insertSource=db.prepare(`INSERT INTO atlas_source_snapshots VALUES (?,?,?,?,?,?) ON CONFLICT(source_key) DO UPDATE SET sha256=excluded.sha256,as_of_date=excluded.as_of_date,imported_at=excluded.imported_at,rights_note=excluded.rights_note`);
  const now=new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const [id,player] of Object.entries(playerData.players||{}))for(const [season,record] of Object.entries(player.seasons||{}))for(const [key,metric] of Object.entries(record.metrics||{})){
      assert(Number.isInteger(Number(id))&&Number.isFinite(metric.value)&&/^https:\/\//.test(metric.source),'Invalid player metric identity or provenance');
      insertMetric.run(Number(id),season,key,metric.value,metric.unit||'',metric.source,metric.sourceField||null,metric.sourceTeam||null,metric.kind||'provider_reported',metric.verifiedAt,metric.sample||null);
    }
    const teamHistory=teamData.history||{[teamData.season]:{teamSeasons:teamData.teamSeasons,teamGames:teamData.teamGames}};
    for(const [season,seasonData] of Object.entries(teamHistory)){
      assert(Object.keys(seasonData.teamSeasons||{}).length===30,'Expected 30 team standings per season');
      for(const [abbr,row] of Object.entries(seasonData.teamSeasons)){
        assert(row.team===abbr&&row.season===season&&row.wins+row.losses===row.games,'Invalid team standing');
        insertStanding.run(abbr,row.season,row.wins,row.losses,row.games,row.pointsPerGame,row.opponentPointsPerGame,row.offRatingEstimated,row.defRatingEstimated,row.netRatingEstimated,row.paceEstimated,row.source,row.verifiedAt);
      }
      for(const [abbr,games] of Object.entries(seasonData.teamGames||{}))for(const game of games){
        assert(game.points-game.opponentPoints===game.pointDiff,'Invalid team game result');
        insertGame.run(abbr,season,game.date,game.opponent,game.home?1:0,game.result,game.points,game.opponentPoints,game.pointDiff,game.rebounds,game.assists,game.source,game.verifiedAt);
      }
    }
    for(const file of [...(playerData.sourceFiles||[]),...(teamData.sourceFiles||[])])insertSource.run(file.name||file.sourceUrl,file.sourceUrl,file.sha256,'2026-11-16',now,'BoxScore Lab CC BY 4.0; NBA-origin downstream publication rights require review');
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return coverage(db);
}
export function coverage(db){
  const count=table=>db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  return {sources:count('atlas_source_snapshots'),playerMetricValues:count('atlas_player_season_metrics'),playerSeasons:db.prepare('SELECT COUNT(*) AS n FROM (SELECT DISTINCT nba_player_id,season FROM atlas_player_season_metrics)').get().n,players:db.prepare('SELECT COUNT(DISTINCT nba_player_id) AS n FROM atlas_player_season_metrics').get().n,playerGameLogs:count('atlas_player_game_logs'),shotEvents:count('atlas_shot_events'),possessions:count('atlas_possessions'),contractYears:count('atlas_contract_years'),teamSeasons:count('atlas_team_seasons'),teamGames:count('atlas_team_games'),bdlGames:count('atlas_bdl_games'),byTeam:db.prepare('SELECT team_abbr,COUNT(*) AS games FROM atlas_team_games GROUP BY team_abbr ORDER BY team_abbr').all(),byMetric:db.prepare('SELECT season,metric_code,COUNT(*) AS records FROM atlas_player_season_metrics GROUP BY season,metric_code ORDER BY season,metric_code').all()};
}
export function readSnapshot(db){
  const players={};
  for(const row of db.prepare('SELECT * FROM atlas_player_season_metrics').all()){
    const season=((players[row.nba_player_id]??={seasons:{}}).seasons[row.season]??={metrics:{}});
    season.metrics[row.metric_code]={value:row.value,unit:row.unit,source:row.source_url,sourceField:row.source_field,sourceTeam:row.source_team,kind:row.kind,verifiedAt:row.verified_at,sample:row.sample};
  }
  for(const row of db.prepare('SELECT * FROM atlas_player_game_logs ORDER BY game_date').all()){
    const season=((players[row.nba_player_id]??={seasons:{}}).seasons[row.season]??={metrics:{}});
    (season.gameLogs??=[]).push({gameId:row.game_id,date:row.game_date,season:row.season,team:row.team_abbr,opponent:row.opponent_abbr,seasonType:row.season_type,minutes:row.minutes,points:row.points,rebounds:row.rebounds,assists:row.assists,fieldGoalsMade:row.fgm,fieldGoalAttempts:row.fga,threeMakes:row.three_made,threeAttempts:row.three_attempts,freeThrowsMade:row.ftm,freeThrowAttempts:row.fta,turnovers:row.turnovers,steals:row.steals,blocks:row.blocks,tsPct:row.ts_pct,efgPct:row.efg_pct,source:row.source_url,verifiedAt:row.verified_at});
  }
  const contracts={};
  for(const row of db.prepare('SELECT * FROM atlas_contract_years').all()){
    if(row.cap_hit_usd==null)continue;
    (contracts[row.nba_player_id]??={})[row.season]={cap:row.cap_hit_usd,currency:'USD',team:row.team_abbr,baseSalary:row.base_salary_usd,cashPaid:row.cash_paid_usd,guaranteed:row.guaranteed_usd,optionType:row.option_type,contractType:row.contract_type,source:row.source_url,verifiedAt:row.verified_at,rightsBasis:row.rights_basis};
  }
  const shotEvents=db.prepare('SELECT * FROM atlas_shot_events ORDER BY game_date,game_event_id').all().map(row=>({playerId:row.nba_player_id,season:row.season,gameId:row.game_id,gameEventId:row.game_event_id,date:row.game_date,locX:row.loc_x,locY:row.loc_y,made:!!row.made,shotValue:row.shot_value,shotDistance:row.shot_distance,shotType:row.shot_type,period:row.period,opponent:row.opponent_abbr,source:row.source_url,verifiedAt:row.verified_at}));
  const possessionGroups=Map.groupBy(db.prepare('SELECT * FROM atlas_possessions').all(),row=>`${row.team_abbr}|${row.season}|${row.source_url}`);
  for(const [key,rows] of possessionGroups){
    const [team,season,source]=key.split('|');
    const possessions=rows.map(row=>({gameId:row.game_id,possessionId:row.possession_id,team,season,side:row.side,points:row.points,onCourtPlayerIds:JSON.parse(row.on_court_player_ids),source}));
    const ids=new Set(possessions.flatMap(row=>row.onCourtPlayerIds));
    for(const id of ids){
      const result=calculateOnOff(possessions,{nbaPlayerId:id,team,season});
      if(Math.min(result.on.offensivePossessions,result.on.defensivePossessions,result.off.offensivePossessions,result.off.defensivePossessions)<20)continue;
      const seasonRecord=((players[id]??={seasons:{}}).seasons[season]??={metrics:{}});
      (seasonRecord.onOff??=[]).push({...result,context:`${team} ${season}`,possessions:result.sample,source,verifiedAt:rows.reduce((date,row)=>row.verified_at>date?row.verified_at:date,'')});
    }
  }
  const teamSeasons={};
  for(const row of db.prepare('SELECT * FROM atlas_team_seasons WHERE season=?').all('2026-27'))teamSeasons[row.team_abbr]={season:row.season,team:row.team_abbr,wins:row.wins,losses:row.losses,games:row.games,pointsPerGame:row.points_per_game,opponentPointsPerGame:row.opponent_points_per_game,offRatingEstimated:row.off_rating_est,defRatingEstimated:row.def_rating_est,netRatingEstimated:row.net_rating_est,paceEstimated:row.pace_est,source:row.source_url,verifiedAt:row.verified_at};
  const teamGames={};
  for(const row of db.prepare('SELECT * FROM atlas_team_games WHERE season=? ORDER BY game_date').all('2026-27'))(teamGames[row.team_abbr]??=[]).push({date:row.game_date,opponent:row.opponent_abbr,home:!!row.home,result:row.result,points:row.points,opponentPoints:row.opponent_points,pointDiff:row.point_diff,rebounds:row.rebounds,assists:row.assists,source:row.source_url,verifiedAt:row.verified_at});
  return {players:{schemaVersion:1,rights:{authorizedForAtlas:true,basis:'Local warehouse read',sourceUrl:'https://boxscorelab.com/downloads/'},players,shotEvents,contracts,metricDefinitions:{},leagueZoneBaselines:{}},teams:{schemaVersion:1,season:'2026-27',teamSeasons,teamGames}};
}
