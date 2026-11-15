import fs from 'node:fs/promises';
const file='src/data/players.json',data=JSON.parse(await fs.readFile(file,'utf8'));
// NBA CDN thumbnails were reviewed on 2026-11-15 in team contact sheets.
// Any image showing another franchise is withheld even when the player ID matches.
const outdated={
  203471:'Clippers uniform on Charlotte roster',
  1641722:'Pelicans uniform on Chicago roster',
  1642383:'Memphis uniform on Dallas roster',
  1642403:'Suns uniform on Detroit roster',
  1643721:'Memphis uniform on Lakers roster',
  1641780:'Clippers uniform on Minnesota roster',
  1642261:'Lakers uniform on Knicks roster',
  1631166:'Timberwolves uniform on Phoenix roster',
  1641755:'Knicks uniform on Toronto roster',
  1641723:'Pelicans uniform on Utah roster'
};
const jerseyConflict=new Set(data.audit.jerseyConflicts.flatMap(c=>c.players.map(name=>`${c.team}|${name}`)));
for(const p of data.players){
  p.jerseyStatus=jerseyConflict.has(`${p.team}|${p.name}`)?'conflict_in_official_roster':'agrees_across_official_roster_sources';
  p.uniformReviewDate='2026-11-15';
  p.uniformReviewMethod='visual review of NBA CDN thumbnail on team contact sheet';
  if(p.imageStatus!=='official_image_found'){
    p.uniformStatus='not_reviewable_missing_image';p.imageDisplayStatus='placeholder';
  }else if(outdated[p.nbaPlayerId]){
    p.uniformStatus='outdated_other_team';p.uniformReviewNote=outdated[p.nbaPlayerId];p.imageDisplayStatus='placeholder';
  }else{
    p.uniformStatus='verified_current_team';p.imageDisplayStatus='show_local_thumbnail';
  }
  if(p.jerseyStatus==='conflict_in_official_roster')p.jerseyReviewNote='Two players on this team share the listed number; do not treat number as independently verified.';
}
for(const id of Object.keys(outdated)){if(!data.players.some(p=>p.nbaPlayerId===Number(id)))throw Error(`Outdated-photo ID absent: ${id}`)}
data.audit.uniformReview={reviewedAt:'2026-11-15',currentTeam:data.players.filter(p=>p.uniformStatus==='verified_current_team').length,outdated:data.players.filter(p=>p.uniformStatus==='outdated_other_team').map(p=>({id:p.nbaPlayerId,name:p.name,team:p.team,note:p.uniformReviewNote})),missing:data.players.filter(p=>p.uniformStatus==='not_reviewable_missing_image').map(p=>({id:p.nbaPlayerId,name:p.name,team:p.team})),jerseyConflicts:data.audit.jerseyConflicts};
await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({players:data.players.length,uniformVerified:data.audit.uniformReview.currentTeam,outdated:data.audit.uniformReview.outdated,missing:data.audit.uniformReview.missing,jerseyConflicts:data.audit.jerseyConflicts},null,2));
