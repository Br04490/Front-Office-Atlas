const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function playerPhoto(player,className='roster-photo'){
  const safeClass=esc(className);
  if(player.imageDisplayStatus==='show_local_thumbnail'&&player.uniformStatus==='verified_current_team'){
    return `<span class="${safeClass}"><img src="./src/assets/players/260x190/${player.nbaPlayerId}.png" alt="Official NBA headshot of ${esc(player.name)} in ${esc(player.team)} uniform" loading="lazy"><span class="photo-fallback">PHOTO UNAVAILABLE</span></span>`;
  }
  return `<span class="${safeClass} photo-unavailable"><span class="photo-silhouette"></span><span class="photo-fallback">${player.imageStatus==='missing_or_placeholder'?'PHOTO MISSING':'UNIFORM REVIEW'}</span></span>`;
}
export function escapePlayerText(value){return esc(value)}
