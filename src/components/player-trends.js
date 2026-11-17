const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const measures=[['points','PTS'],['rebounds','REB'],['assists','AST'],['minutes','MIN'],['fieldGoalAttempts','FGA'],['threeAttempts','3PA'],['freeThrowAttempts','FTA'],['tsPct','TS%'],['efgPct','eFG%'],['turnovers','TOV'],['steals','STL'],['blocks','BLK']];
const percent=new Set(['tsPct','efgPct']);
export function trendSeries(record,metric,windowSize=8){
  const logs=(record?.gameLogs||[]).filter(log=>/^\d{4}-\d{2}-\d{2}$/.test(log.date)&&/^https:\/\//.test(log.source||'')&&log.verifiedAt).sort((a,b)=>a.date.localeCompare(b.date));
  const selected=logs.slice(-windowSize).filter(log=>Number.isFinite(log[metric]));
  const average=selected.length?selected.reduce((sum,log)=>sum+log[metric],0)/selected.length:null;
  const seasonValues=logs.filter(log=>Number.isFinite(log[metric]));
  const seasonAverage=seasonValues.length?seasonValues.reduce((sum,log)=>sum+log[metric],0)/seasonValues.length:null;
  return {logs,selected,average,seasonAverage};
}
export function trendWorkspace(record,state){
  const metric=state.trendMetric,windowSize=Number(state.trendWindow)||8;
  const {logs,selected,average,seasonAverage}=trendSeries(record,metric,windowSize);
  const controls=`<div class="profile-shot-controls"><label>MEASURE<select data-profile-field="trendMetric">${measures.map(([key,label])=>`<option value="${key}" ${key===metric?'selected':''} ${logs.some(item=>Number.isFinite(item[key]))?'':'disabled'}>${label}</option>`).join('')}</select></label><label>WINDOW<select data-profile-field="trendWindow">${[5,8,10,15,20].map(n=>`<option value="${n}" ${n===windowSize?'selected':''}>Last ${n}</option>`).join('')}</select></label></div>`;
  if(!selected.length)return `<div class="profile-glass"><h3>Performance trends</h3>${controls}<p>Player game logs unavailable—connect an authorized box-score provider or import a licensed game-log export. Season totals cannot reconstruct individual games.</p><small>0 sourced games for this player and season. No bar heights are inferred.</small></div>`;
  const format=value=>percent.has(metric)?`${(value*100).toFixed(1)}%`:value.toFixed(1);
  const maximum=Math.max(...selected.map(log=>log[metric]),0.01);
  const bars=selected.map(log=>`<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><small style="width:100px;flex:none">${esc(log.date.slice(5))} · ${esc(log.opponent||'—')}</small><span style="display:inline-block;min-width:3px;width:${Math.max(2,log[metric]/maximum*65)}%;height:13px;border-radius:5px;background:#56a8df" title="${esc(log.date)} ${format(log[metric])}"></span><strong>${format(log[metric])}</strong></div>`).join('');
  return `<div class="profile-glass"><h3>Performance trends</h3>${controls}<div role="img" aria-label="${esc(metric)} for last ${selected.length} sourced games">${bars}</div><p>Last ${selected.length} average ${format(average)} · connected season average ${format(seasonAverage)}. ${selected.length<5?'Small sample.':''}</p><small>Source: <a href="${esc(selected.at(-1).source)}" target="_blank" rel="noopener noreferrer">Game-log provider</a> · verified ${esc(selected.at(-1).verifiedAt)} · ${esc(state.season)}. Per-game percentages are averaged without attempt weighting.</small></div>`;
}
