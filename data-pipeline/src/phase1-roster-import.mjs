import {playerKey} from '../../src/player-key.js';
import {campusRegion} from '../../src/campus-region.js';
import {teams as nbaTeams} from '../../src/data/teams.js';

const validUrl=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value));
const filled=value=>typeof value==='string'&&value.trim().length>0;
function requireSource(value,label){if(!validUrl(value))throw Error(`${label} requires an HTTPS source URL`)}

export function importPhase1Rosters(db,batch,manifest){
 if(!manifest?.authorizedForAtlas||!filled(manifest.rightsBasis)||!filled(manifest.provider)||!date(manifest.verifiedAt)||!validUrl(manifest.sourceUrl)||!/^[a-f0-9]{64}$/i.test(manifest.sourceSha256||''))throw Error('Dated, hashed source and explicit Atlas rights are required');
 if(!Array.isArray(batch?.teams)||!batch.teams.length)throw Error('A nonempty teams array is required');
 const provider=manifest.provider,seenTeams=new Set,prepared=[];
 for(const team of batch.teams){
  if(!['NCAA_D1','G_LEAGUE'].includes(team.pool)||!filled(team.providerTeamId)||!filled(team.name)||!/^\d{4}-\d{2}$/.test(team.season||'')||!filled(team.conference)||!filled(team.city)||!Array.isArray(team.players))throw Error('Incomplete Phase 1 team record');
  if(team.pool==='NCAA_D1'&&!campusRegion(team.state))throw Error('NCAA campus state is required for geographic region');
  if(team.pool==='G_LEAGUE'&&!['Eastern','Western'].includes(team.conference))throw Error('G League conference must be Eastern or Western');
  if(team.pool==='G_LEAGUE'&&team.name==='Mexico City Capitanes'&&team.nbaAffiliateAbbr)throw Error('Mexico City Capitanes has no NBA parent franchise');
  if(team.pool==='G_LEAGUE'&&team.nbaAffiliateAbbr&&!nbaTeams.some(nba=>nba.abbr===team.nbaAffiliateAbbr))throw Error('Unknown NBA affiliate abbreviation');
  if(!Number.isInteger(team.officialRosterCount)||team.officialRosterCount<0)throw Error('Official listed roster count is required');
  requireSource(team.rosterUrl,'Roster');requireSource(team.sourceUrl,'Team');
  if(team.logoUrl&&(!validUrl(team.logoUrl)||!filled(team.logoRightsBasis)))throw Error('Team logo requires HTTPS URL and separate rights basis');
  const key=[team.pool,provider,team.providerTeamId,team.season].join('|');if(seenTeams.has(key))throw Error('Duplicate team in batch');seenTeams.add(key);
  const seenPlayers=new Set;
  for(const player of team.players){
   if(!filled(player.providerPlayerId)||!filled(player.name)||!filled(player.rosterStatus)||!validUrl(player.bioUrl))throw Error('Player requires source ID, name, status and official bio URL');
   if(seenPlayers.has(String(player.providerPlayerId)))throw Error('Duplicate player ID within roster');seenPlayers.add(String(player.providerPlayerId));
   if(player.photoUrl&&!validUrl(player.photoUrl))throw Error('Photo URL must be HTTPS');
   if(player.photoStatus==='approved'&&(!player.photoUrl||!filled(player.photoRightsBasis)))throw Error('Approved photo requires its own rights basis');
  }
  const coach=team.headCoach;
  if(coach&&( !filled(coach.name)||! /^(head coach|interim head coach)$/i.test(coach.title||'')||!validUrl(coach.bioUrl)||!validUrl(coach.sourceUrl)))throw Error('Head coach requires verified title and official source');
  prepared.push({team,coach,complete:team.players.length===team.officialRosterCount&&team.players.length>0});
 }
 const teamInsert=db.prepare('INSERT INTO atlas_external_teams VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(pool,source_provider,provider_team_id,season) DO UPDATE SET official_name=excluded.official_name,nickname=excluded.nickname,conference=excluded.conference,conference_source_url=excluded.conference_source_url,city=excluded.city,state_code=excluded.state_code,campus_region=excluded.campus_region,nba_affiliate_abbr=excluded.nba_affiliate_abbr,official_site_url=excluded.official_site_url,roster_source_url=excluded.roster_source_url,coaching_source_url=excluded.coaching_source_url,logo_url=excluded.logo_url,official_roster_count=excluded.official_roster_count,roster_completeness=excluded.roster_completeness,verified_at=excluded.verified_at,source_url=excluded.source_url,rights_basis=excluded.rights_basis,source_sha256=excluded.source_sha256');
 const coachInsert=db.prepare('INSERT INTO atlas_external_coaches VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(pool,source_provider,provider_team_id,season) DO UPDATE SET coach_name=excluded.coach_name,title=excluded.title,interim=excluded.interim,bio_url=excluded.bio_url,photo_url=excluded.photo_url,photo_rights_basis=excluded.photo_rights_basis,verified_at=excluded.verified_at,source_url=excluded.source_url');
 const identityInsert=db.prepare('INSERT INTO atlas_external_players VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(pool,source_provider,provider_player_id,season) DO UPDATE SET player_name=excluded.player_name,team_id=excluded.team_id,team_name=excluded.team_name,roster_status=excluded.roster_status,source_url=excluded.source_url,verified_at=excluded.verified_at,rights_basis=excluded.rights_basis,source_sha256=excluded.source_sha256');
 const bioInsert=db.prepare('INSERT INTO atlas_external_player_bio VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(player_key) DO UPDATE SET full_name=excluded.full_name,date_of_birth=excluded.date_of_birth,height=excluded.height,weight=excluded.weight,hometown=excluded.hometown,position=excluded.position,jersey_number=excluded.jersey_number,class_or_experience=excluded.class_or_experience,previous_school=excluded.previous_school,bio_url=excluded.bio_url,photo_url=excluded.photo_url,photo_status=excluded.photo_status,photo_rights_basis=excluded.photo_rights_basis,verified_at=excluded.verified_at,source_url=excluded.source_url');
 const memberInsert=db.prepare('INSERT INTO atlas_external_memberships VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(player_key,pool,source_provider,provider_team_id,season) DO UPDATE SET membership_status=excluded.membership_status,two_way_status=excluded.two_way_status,assignment_status=excluded.assignment_status,source_url=excluded.source_url,verified_at=excluded.verified_at');
 const prior=db.prepare('SELECT source_url,source_sha256,verified_at FROM atlas_external_teams WHERE pool=? AND source_provider=? AND provider_team_id=? AND season=?');
 const clearMembers=db.prepare('DELETE FROM atlas_external_memberships WHERE pool=? AND source_provider=? AND provider_team_id=? AND season=?');
 const clearCoach=db.prepare('DELETE FROM atlas_external_coaches WHERE pool=? AND source_provider=? AND provider_team_id=? AND season=?');
 for(const {team} of prepared){const existing=prior.get(team.pool,provider,team.providerTeamId,team.season);if(existing&&existing.source_sha256!==manifest.sourceSha256&&(!manifest.reconcileExisting||existing.source_url!==team.sourceUrl||existing.verified_at>=manifest.verifiedAt))throw Error('Changed team snapshot requires newer dated reconciliation from the same official source');}
 db.exec('BEGIN IMMEDIATE');try{
  for(const {team,coach,complete} of prepared){
   const existing=prior.get(team.pool,provider,team.providerTeamId,team.season);
   if(existing&&existing.source_sha256!==manifest.sourceSha256){clearMembers.run(team.pool,provider,team.providerTeamId,team.season);clearCoach.run(team.pool,provider,team.providerTeamId,team.season)}
   teamInsert.run(team.pool,provider,team.providerTeamId,team.season,team.name,team.nickname??null,team.conference,team.conferenceSourceUrl??null,team.city,team.state??null,team.pool==='NCAA_D1'?campusRegion(team.state):null,team.nbaAffiliateAbbr??null,team.officialSiteUrl??null,team.rosterUrl,team.coachingUrl??null,team.logoUrl??null,team.officialRosterCount,complete?'complete':'incomplete',manifest.verifiedAt,team.sourceUrl,manifest.rightsBasis,manifest.sourceSha256);
   if(coach)coachInsert.run(team.pool,provider,team.providerTeamId,team.season,coach.name,coach.title,/^interim/i.test(coach.title)?1:0,coach.bioUrl,coach.photoRightsBasis?coach.photoUrl??null:null,coach.photoRightsBasis??null,manifest.verifiedAt,coach.sourceUrl);
   for(const player of team.players){
    const key=playerKey(team.pool,provider,player.providerPlayerId);
    identityInsert.run(team.pool,provider,String(player.providerPlayerId),player.name,team.providerTeamId,team.name,team.season,player.rosterStatus,null,team.rosterUrl,manifest.verifiedAt,manifest.rightsBasis,manifest.sourceSha256);
    bioInsert.run(key,player.name,player.dateOfBirth??null,player.height??null,player.weight??null,player.hometown??null,player.position??null,player.jersey??null,player.classOrExperience??null,player.previousSchool??null,player.bioUrl,player.photoStatus==='approved'?player.photoUrl:null,player.photoStatus==='approved'?'approved':'pending',player.photoRightsBasis??null,manifest.verifiedAt,player.bioUrl);
    memberInsert.run(key,team.pool,provider,team.providerTeamId,team.season,player.rosterStatus,player.twoWayStatus??null,player.assignmentStatus??null,team.rosterUrl,manifest.verifiedAt);
   }
  }
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error}
 return {teams:prepared.length,players:prepared.reduce((sum,row)=>sum+row.team.players.length,0),completeRosters:prepared.filter(row=>row.complete).length};
}
