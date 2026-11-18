import {teams} from '../../src/data/teams.js';

export const contractColumns=['nba_player_id','team','season','contract_type','signed_date','base_salary_usd','cap_hit_usd','cash_paid_usd','guaranteed_usd','likely_incentives_usd','unlikely_incentives_usd','option_type','option_deadline','no_trade','bird_rights','trade_restriction','cap_hold_usd','dead_money_usd','source_url','verified_at'];
const teamIds=new Set(teams.map(team=>team.abbr));
export function importContractRows(db,records,{authorizedForAtlas,rightsBasis,roster}){
  if(authorizedForAtlas!==true||!rightsBasis)throw Error('Explicit contract usage permission required');
  const rosterById=new Map(roster.map(player=>[player.nbaPlayerId,player]));
  const insert=db.prepare(`INSERT INTO atlas_contract_years VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(nba_player_id,team_abbr,season,source_url) DO UPDATE SET contract_type=excluded.contract_type,signed_date=excluded.signed_date,base_salary_usd=excluded.base_salary_usd,cap_hit_usd=excluded.cap_hit_usd,cash_paid_usd=excluded.cash_paid_usd,guaranteed_usd=excluded.guaranteed_usd,likely_incentives_usd=excluded.likely_incentives_usd,option_type=excluded.option_type,option_deadline=excluded.option_deadline,no_trade=excluded.no_trade,bird_rights=excluded.bird_rights,trade_restriction=excluded.trade_restriction,cap_hold_usd=excluded.cap_hold_usd,dead_money_usd=excluded.dead_money_usd,verified_at=excluded.verified_at,rights_basis=excluded.rights_basis`);
  const amount=value=>{if(value===''||value==null)return null;const n=Number(value);if(!Number.isSafeInteger(n)||n<0)throw Error('Contract amounts must be nonnegative whole USD');return n};
  const existingCap=db.prepare('SELECT cap_hit_usd,source_url FROM atlas_contract_years WHERE nba_player_id=? AND season=? AND source_url<>?');
  const seen=new Set;
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const row of records){
      const id=Number(row.nba_player_id),key=`${id}:${row.team}:${row.season}:${row.source_url}`;
      if(!rosterById.has(id)||!teamIds.has(row.team)||!/^20\d{2}-\d{2}$/.test(row.season||'')||!/^https:\/\//.test(row.source_url||'')||!/^\d{4}-\d{2}-\d{2}$/.test(row.verified_at||'')||!row.contract_type||seen.has(key))throw Error(`Invalid contract identity ${key}`);
      if(row.season==='2026-27'&&rosterById.get(id).team!==row.team)throw Error(`Current roster team mismatch for NBA ${id}: ${rosterById.get(id).team} versus ${row.team}`);
      seen.add(key);
      const base=amount(row.base_salary_usd),cap=amount(row.cap_hit_usd),cash=amount(row.cash_paid_usd),guaranteed=amount(row.guaranteed_usd);
      if(guaranteed!=null&&base!=null&&guaranteed>base)throw Error(`Guarantee exceeds base salary for ${key}`);
      for(const prior of existingCap.all(id,row.season,row.source_url))throw Error(`Conflicting cap hit or duplicate contract source ${prior.source_url} for ${key}; reconcile before import`);
      if(row.no_trade!=''&&!['0','1',0,1].includes(row.no_trade))throw Error(`Invalid no-trade flag for ${key}`);
      insert.run(id,row.team,row.season,row.contract_type,row.signed_date||null,base,cap,cash,guaranteed,amount(row.likely_incentives_usd),amount(row.unlikely_incentives_usd),row.option_type||null,row.option_deadline||null,row.no_trade===''?null:Number(row.no_trade),row.bird_rights||null,row.trade_restriction||null,amount(row.cap_hold_usd),amount(row.dead_money_usd),row.source_url,row.verified_at,rightsBasis);
    }
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
  return {importedRows:records.length};
}
