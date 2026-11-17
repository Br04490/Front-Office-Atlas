const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const measures=[['points','PTS'],['rebounds','REB'],['assists','AST'],['minutes','MIN'],['fieldGoalsMade','FGM'],['fieldGoalAttempts','FGA'],['fgPct','FG%'],['threeMakes','3PM'],['threeAttempts','3PA'],['threePct','3P%'],['freeThrowsMade','FTM'],['freeThrowAttempts','FTA'],['ftPct','FT%'],['tsPct','TS%'],['efgPct','eFG%'],['turnovers','TOV'],['steals','STL'],['blocks','BLK']];
const percent=new Set(['fgPct','threePct','ftPct','tsPct','efgPct']);
export function trendValue(log,metric){
 const ratio=(made,attempts)=>Number.isFinite(made)&&Number.isFinite(attempts)&&attempts>0?made/attempts:null;
 if(metric==='fgPct')return ratio(log.fieldGoalsMade,log.fieldGoalAttempts);
 if(metric==='threePct')return ratio(log.threeMakes,log.threeAttempts);
 if(metric==='ftPct')return ratio(log.freeThrowsMade,log.freeThrowAttempts);
 return Number.isFinite(log[metric])?log[metric]:null;
}
export function trendSeries(record,metric,windowSize=8,{dateFrom='',dateTo='',seasonType='all',opponent='all'}={}){
 const logs=(record?.gameLogs||[]).filter(log=>/^\d{4}-\d{2}-\d{2}$/.test(log.date)&&/^https:\/\//.test(log.source||'')&&log.verifiedAt)
  .filter(log=>(!dateFrom||log.date>=dateFrom)&&(!dateTo||log.date<=dateTo)&&(seasonType==='all'||log.seasonType===seasonType)&&(opponent==='all'||log.opponent===opponent))
  .sort((a,b)=>a.date.localeCompare(b.date)||String(a.gameId||'').localeCompare(String(b.gameId||'')));
 const selected=logs.filter(log=>trendValue(log,metric)!==null).slice(-windowSize);
 const values=selected.map(log=>trendValue(log,metric));
 const average=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
 const seasonValues=logs.map(log=>trendValue(log,metric)).filter(value=>value!==null);
 const seasonAverage=seasonValues.length?seasonValues.reduce((sum,value)=>sum+value,0)/seasonValues.length:null;
 const middle=Math.floor(values.length/2),early=values.slice(0,middle),late=values.slice(middle);
 const direction=early.length&&late.length?late.reduce((a,b)=>a+b,0)/late.length-early.reduce((a,b)=>a+b,0)/early.length:null;
 return {logs,selected,average,seasonAverage,minimum:values.length?Math.min(...values):null,maximum:values.length?Math.max(...values):null,direction};
}
export function trendWorkspace(record,state){
 const metric=state.trendMetric,windowSize=Number(state.trendWindow)||8;
 const filters={dateFrom:state.trendDateFrom||'',dateTo:state.trendDateTo||'',seasonType:state.trendSeasonType||'all',opponent:state.trendOpponent||'all'};
 const {logs,selected,average,seasonAverage,minimum,maximum,direction}=trendSeries(record,metric,windowSize,filters);
 const all=(record?.gameLogs||[]).filter(log=>/^https:\/\//.test(log.source||'')&&log.verifiedAt),opponents=[...new Set(all.map(log=>log.opponent).filter(Boolean))].sort();
 const controls=`<div class="profile-shot-controls"><label>MEASURE<select data-profile-field="trendMetric">${measures.map(([key,label])=>`<option value="${key}" ${key===metric?'selected':''} ${all.some(item=>trendValue(item,key)!==null)?'':'disabled'}>${label}</option>`).join('')}</select></label><label>WINDOW<select data-profile-field="trendWindow">${[5,8,10,15,20].map(n=>`<option value="${n}" ${n===windowSize?'selected':''}>Last ${n}</option>`).join('')}</select></label><label>SEASON TYPE<select data-profile-field="trendSeasonType" ${all.length?'':'disabled'}><option value="all">All</option>${['Regular Season','Playoffs'].map(value=>`<option value="${value}" ${filters.seasonType===value?'selected':''}>${value}</option>`).join('')}</select></label><label>OPPONENT<select data-profile-field="trendOpponent" ${opponents.length?'':'disabled'}><option value="all">All</option>${opponents.map(value=>`<option value="${esc(value)}" ${filters.opponent===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label><label>FROM<input type="date" data-profile-field="trendDateFrom" value="${esc(filters.dateFrom)}" ${all.length?'':'disabled'}></label><label>THROUGH<input type="date" data-profile-field="trendDateTo" value="${esc(filters.dateTo)}" ${all.length?'':'disabled'}></label></div>`;
 if(!selected.length)return `<div class="profile-glass"><h3>Performance trends</h3>${controls}<p>Player game logs unavailable for these filters—connect an authorized box-score provider or import a licensed game-log export. Season totals cannot reconstruct individual games.</p><small>0 sourced matching games. No bar heights are inferred.</small></div>`;
 const format=value=>percent.has(metric)?`${(value*100).toFixed(1)}%`:value.toFixed(1);
 const max=Math.max(...selected.map(log=>trendValue(log,metric)),0.01);
 const bars=selected.map(log=>{const value=trendValue(log,metric);return `<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><small style="width:100px;flex:none">${esc(log.date.slice(5))} · ${esc(log.opponent||'—')}</small><span style="display:inline-block;min-width:3px;width:${Math.max(2,value/max*65)}%;height:13px;border-radius:5px;background:#56a8df" title="${esc(log.date)} ${format(value)}"></span><strong>${format(value)}</strong></div>`}).join('');
 return `<div class="profile-glass"><h3>Performance trends</h3>${controls}<div role="img" aria-label="${esc(metric)} for last ${selected.length} sourced games">${bars}</div><p>Last ${selected.length} average ${format(average)} · filtered season average ${format(seasonAverage)} · low ${format(minimum)} · high ${format(maximum)}${direction===null?'':` · recent half ${direction>=0?'+':''}${format(direction)} versus prior half`}. ${selected.length<5?'Small sample.':''}</p><small>Source: <a href="${esc(selected.at(-1).source)}" target="_blank" rel="noopener noreferrer">Game-log provider</a> · verified ${esc(selected.at(-1).verifiedAt)} · ${esc(state.season)}. Per-game percentages are averaged without attempt weighting. Home/away and plus/minus remain unavailable in the current import schema.</small></div>`;
}
