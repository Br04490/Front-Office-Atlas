import {playerPhoto,escapePlayerText as esc} from './player-photo.js';

export function playerSearchResults(records,context){
  const query=document.querySelector('#ws-search')?.value.trim().toLowerCase()||'';
  const pool=document.querySelector('#ws-pool')?.value;
  if(pool!=='NBA teams and players')return '<div class="ws-note"><strong>Source not connected</strong><p>Only the current NBA roster snapshot is searchable in this local preview.</p></div>';
  if(!query)return '<div class="ws-note"><strong>Enter a search</strong><p>Search a current NBA player name, team abbreviation, jersey number, or NBA player ID.</p></div>';
  const found=records.filter(p=>(!context||p.team===context)&&[p.name,p.team,p.jersey,String(p.nbaPlayerId)].some(value=>String(value).toLowerCase().includes(query))).slice(0,30);
  if(!found.length)return '<div class="ws-note"><strong>No roster matches</strong><p>No player in the connected 30-team NBA roster snapshot matches this query.</p></div>';
  return `<div class="ws-result"><strong>${found.length} OFFICIAL ROSTER MATCH${found.length===1?'':'ES'}</strong><p>Current NBA roster snapshot only · advanced statistics and film not connected.</p><div class="search-results">${found.map(p=>`<button class="search-player" data-open-player="${p.nbaPlayerId}">${playerPhoto(p,'search-photo')}<span><strong>${esc(p.name)}</strong><small>${esc(p.team)} · #${esc(p.jersey)} · NBA ID ${p.nbaPlayerId}${p.uniformStatus!=='verified_current_team'?' · PHOTO REVIEW':''}</small></span></button>`).join('')}</div></div>`;
}
