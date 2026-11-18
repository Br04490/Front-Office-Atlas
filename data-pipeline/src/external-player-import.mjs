const pools=new Set(['NCAA_D1','HIGH_SCHOOL_TOP_100','EUROLEAGUE','G_LEAGUE']);
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value));
const validUrl=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
export function importExternalPlayers(db,rows,manifest){
 if(!manifest?.authorizedForAtlas||!manifest?.rightsBasis||!validUrl(manifest.sourceUrl)||!date(manifest.verifiedAt)||!/^[a-f0-9]{64}$/i.test(manifest.sourceSha256||'')||!manifest.provider)throw Error('A dated source, rights basis, provider and SHA-256 are required');
 if(!Array.isArray(rows)||!rows.length)throw Error('No player identities supplied');
 const seen=new Set,prepared=[];
 for(const row of rows){
  if(!pools.has(row.pool)||!row.providerPlayerId||!row.playerName?.trim()||!row.teamId||!row.teamName?.trim()||!/^\d{4}-\d{2,4}$/.test(row.season)||!row.rosterStatus)throw Error('Incomplete or invalid external player identity');
  if(row.pool==='HIGH_SCHOOL_TOP_100'&&(!Number.isInteger(row.rank)||row.rank<1||row.rank>100))throw Error('Top-100 identity requires a rank from 1 to 100');
  const key=[row.pool,manifest.provider,row.providerPlayerId,row.season].join('|');if(seen.has(key))throw Error(`Duplicate external identity: ${key}`);seen.add(key);
  prepared.push([row.pool,manifest.provider,String(row.providerPlayerId),row.playerName.trim(),String(row.teamId),row.teamName.trim(),row.season,row.rosterStatus,row.rank??null,manifest.sourceUrl,manifest.verifiedAt,manifest.rightsBasis,manifest.sourceSha256]);
 }
 const insert=db.prepare('INSERT INTO atlas_external_players VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(pool,source_provider,provider_player_id,season) DO UPDATE SET player_name=excluded.player_name,team_id=excluded.team_id,team_name=excluded.team_name,roster_status=excluded.roster_status,rank_number=excluded.rank_number,source_url=excluded.source_url,verified_at=excluded.verified_at,rights_basis=excluded.rights_basis,source_sha256=excluded.source_sha256');
 const prior=db.prepare('SELECT source_url,source_sha256 FROM atlas_external_players WHERE pool=? AND source_provider=? AND provider_player_id=? AND season=?');
 for(const row of prepared){const existing=prior.get(row[0],row[1],row[2],row[6]);if(existing&&(existing.source_url!==row[9]||existing.source_sha256!==row[12]))throw Error('Conflicting external identity source requires reconciliation');}
 db.exec('BEGIN IMMEDIATE');try{for(const row of prepared)insert.run(...row);db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}
 return {admitted:prepared.length,pools:db.prepare('SELECT pool,COUNT(DISTINCT provider_player_id) AS players,COUNT(DISTINCT team_id) AS teams FROM atlas_external_players GROUP BY pool ORDER BY pool').all()};
}
