const fmt=value=>Number.isFinite(value)?value.toFixed(1):'—';
const cell=(label,value,detail)=>`<div class="kpi glass"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`;
export function teamTrendData(snapshot,team,windowSize){
  const standing=snapshot?.teamSeasons?.[team];
  const games=snapshot?.teamGames?.[team]?.slice(-windowSize)||[];
  if(!standing)return null;
  const markers=games.map((game,index)=>({game,x:games.length===1?300:index*600/(games.length-1),y:85-Math.max(-30,Math.min(30,game.pointDiff))*2}));
  return {standing,games,markers,rollingMargin:games.length?games.reduce((sum,game)=>sum+game.pointDiff,0)/games.length:null};
}
export function renderTeamTrend(snapshot,team,windowSize){
  const data=teamTrendData(snapshot,team,windowSize);
  if(!data)return null;
  const {standing,games,markers,rollingMargin}=data;
  const points=markers.map(({x,y})=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return {kpis:`${cell('Offensive Rating',fmt(standing.offRatingEstimated),'Estimated · 2026–27')}${cell('Defensive Rating',fmt(standing.defRatingEstimated),'Estimated · 2026–27')}${cell('Net Rating',fmt(standing.netRatingEstimated),'Estimated · 2026–27')}${cell('W–L Record',`${standing.wins}–${standing.losses}`,`${standing.games} games · 2026–27`)}`,
    chart:`<div class="chart"><svg viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label="Point margin by game, last ${games.length} games"><path d="M0 85 H600" fill="none" stroke="#92a7bb" stroke-width="1" stroke-dasharray="4 6"/><polyline points="${points}" fill="none" stroke="#68baf2" stroke-width="3" vector-effect="non-scaling-stroke"/>${markers.map(({x,y,game})=>`<circle role="button" tabindex="0" data-team-game="${game.date}" aria-label="Open ${game.date} game versus ${game.opponent}" cx="${x}" cy="${y}" r="7" fill="${game.pointDiff>=0?'#66d8b3':'#f28d9b'}"><title>${game.date} vs ${game.opponent}: ${game.pointDiff>0?'+':''}${game.pointDiff}</title></circle>`).join('')}</svg></div><p class="muted">Last ${games.length} games · average margin ${rollingMargin>=0?'+':''}${fmt(rollingMargin)} points · zero line marks even score. Select a game marker for its source record.</p><p class="tiny-note">BoxScore Lab snapshot, verified ${standing.verifiedAt}. Ratings are source estimates. <a href="${standing.source}" target="_blank" rel="noopener noreferrer">Standings source</a> · <a href="${games[0]?.source||standing.source}" target="_blank" rel="noopener noreferrer">Game source</a></p>`};
}
export function renderTeamGames(snapshot,team,selectedDate=null){
  const standing=snapshot?.teamSeasons?.[team];
  const games=snapshot?.teamGames?.[team]||[];
  if(!standing)return null;
  const latest=games.at(-1);
  const kpis=`${cell('Games Ingested',String(games.length),'2026–27 snapshot')}${cell('Latest Result',latest?`${latest.result} ${latest.points}–${latest.opponentPoints}`:'—',latest?`${latest.date} vs ${latest.opponent}`:'No games')}${cell('W–L Record',`${standing.wins}–${standing.losses}`,'Verified standings')}${cell('Last Sync',standing.verifiedAt,'Local source snapshot')}`;
  const rows=games.slice().reverse().map(game=>`<tr><td><button class="ws-small" data-team-game="${game.date}">${game.date}</button></td><td>${game.home?'vs':'@'} ${game.opponent}</td><td>${game.result}</td><td>${game.points}–${game.opponentPoints}</td><td>${game.pointDiff>0?'+':''}${game.pointDiff}</td></tr>`).join('');
  const selected=games.find(game=>game.date===selectedDate);
  const detail=selected?`<div class="ws-note"><strong>${selected.date} · ${team} ${selected.result} ${selected.points}–${selected.opponentPoints} ${selected.home?'vs':'@'} ${selected.opponent}</strong><p>Margin ${selected.pointDiff>0?'+':''}${selected.pointDiff} · ${Number.isFinite(selected.rebounds)?`${selected.rebounds} team rebounds`:'Rebounds unavailable'} · ${Number.isFinite(selected.assists)?`${selected.assists} team assists`:'Assists unavailable'}.</p><p>Verified ${selected.verifiedAt} · <a href="${selected.source}" target="_blank" rel="noopener noreferrer">Source game record ↗</a>. Player box scores, scoring runs and possessions require event data.</p></div>`:'';
  return {kpis,table:`${detail}<div style="overflow:auto;max-height:420px"><table style="width:100%;text-align:left;border-spacing:0 8px"><thead><tr><th>Date</th><th>Opponent</th><th>Result</th><th>Score</th><th>Margin</th></tr></thead><tbody>${rows}</tbody></table></div><p class="tiny-note">Team game results only. Player box scores and possession events are not connected. <a href="${games[0]?.source||standing.source}" target="_blank" rel="noopener noreferrer">BoxScore Lab game source</a></p>`};
}
