import {playerPhoto,escapePlayerText as esc} from './player-photo.js';
import {teams} from '../data/teams.js';
import {parseAtlasQuery,runAtlasPlan} from '../atlas-query-engine.js';
export function playerSearchResults(records,context){
 const query=document.querySelector('#ws-search')?.value.trim()||'',pool=document.querySelector('#ws-pool')?.value;
 if(pool!=='NBA teams and players')return '<div class="ws-note"><strong>Source not connected</strong><p>Only the current NBA roster snapshot is searchable here. Other competitions require authorized records.</p></div>';
 if(!query)return '<div class="ws-note"><strong>Enter a search</strong><p>Ask for a name, team, or supported roster filter.</p></div>';
 const plan=parseAtlasQuery(query,records,teams);if(context&&!plan.filters.some(f=>f.field==='team')){plan.filters.push({field:'team',operator:'eq',value:context});plan.teamId=context}
 const result=runAtlasPlan(plan,records,teams);
 if(result.status==='insufficient_data')return `<div class="ws-note"><strong>INSUFFICIENT SOURCE DATA</strong><p>${esc(result.summary)}</p></div>`;
 if(!result.players.length)return `<div class="ws-note"><strong>NO VERIFIED ROSTER MATCHES</strong><p>${esc(result.summary)}</p></div>`;
 return `<div class="ws-result"><strong>${result.players.length} NBA ROSTER MATCH${result.players.length===1?'':'ES'}</strong><p>Roster source: NBA.com and NBA Stats · advanced statistics and film are not connected.</p><div class="roster-grid atlas-search-grid">${result.players.slice(0,24).map(p=>`<button class="player player-verified glass" data-open-player="${p.nbaPlayerId}" aria-label="Open ${esc(p.name)} player profile"><span class="player-no">#${esc(p.jersey)}</span>${playerPhoto(p)}<strong>${esc(p.name)}</strong><small>${esc(teams.find(t=>t.abbr===p.team)?.name||p.team)} · ${esc(p.position||'Position pending')}</small></button>`).join('')}</div>${result.players.length>24?'<p>Showing 24. Use Ask Atlas for the full result and pagination.</p>':''}</div>`;
}
