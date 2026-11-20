const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>Number.isFinite(Number(value))?Number(value):null;
const sourceDate=item=>item?.verifiedAt||item?.verified_at||item?.updated_at||'Date pending';
const metric=(season,key)=>{const item=season?.metrics?.[key];return item&&Number.isFinite(item.value)?item:null};
export function playerHealthData(player,record={},season='2026-27'){
 const row=record.seasons?.[season]||{}, keys=['points','rebounds','assists','usage','minutes','tsPct','defensiveRating','netRating'];
 const available=keys.map(key=>({key,item:metric(row,key)})).filter(x=>x.item);
 const pending=keys.filter(key=>!metric(row,key));
 const score=available.length>=3?Math.round(available.reduce((sum,x)=>sum+(x.key==='defensiveRating'?-x.item.value:x.item.value),0)/available.length):null;
 return {playerId:player.nbaPlayerId,name:player.name,team:player.team,season,score,available,pending,sample:metric(row,'games')?.value||0,sourceDate:sourceDate(available[0]?.item)};
}
export function healthBar(label,value,status='Pending',detail='Sourced comparison unavailable'){
 const width=Number.isFinite(value)?Math.max(4,Math.min(100,value)):8;
 return `<div class="health-bar-row"><div><strong>${esc(label)}</strong><span>${esc(status)}</span></div><div class="health-bar-track"><i style="width:${width}%"></i></div><small>${esc(detail)}</small></div>`;
}
export function teamHealthView(snapshot,team,season='2026-27'){
 const rows=Object.values(snapshot?.teamSeasons||{}).filter(row=>row.season===season&&row.games>0),selected=rows.find(row=>row.team===team);
 if(!selected||rows.length!==30)return `<section class="health-view glass"><p class="eyebrow">TEAM HEALTH · ${esc(team)}</p><h2>Insufficient Data</h2><p>Comparable 30-team records are not available for ${esc(season)}.</p>${healthBar('Offense',null)}${healthBar('Defense',null)}${healthBar('Shooting',null)}</section>`;
 const rank=(key,descending=true)=>{const sorted=rows.slice().sort((a,b)=>(descending?-1:1)*(a[key]-b[key]));return sorted.findIndex(row=>row.team===team)+1};
 const metrics=[['Offense',selected.pointsPerGame,'Points per game',rank('pointsPerGame')],['Defense',selected.opponentPointsPerGame,'Opponent points allowed',rank('opponentPointsPerGame',false)]];
 return `<section class="health-view glass" aria-label="Team Health"><div class="health-heading"><div><p class="eyebrow">TEAM HEALTH · ${esc(team)} · ${esc(season)}</p><h2>Team Health</h2><p>Source-linked comparison across all 30 teams. Lower opponent scoring ranks higher.</p></div><span class="health-status">${selected.games} games · checked ${esc(sourceDate(selected))}</span></div><div class="health-grid">${metrics.map(([label,value,detail,rankValue])=>healthBar(label,Math.max(8,100-(rankValue-1)*3.2),`#${rankValue} of 30`,` ${Number(value).toFixed(1)} · ${detail} · source ${esc(selected.source||'pending')}`)).join('')}</div><div class="health-missing"><strong>Pending inputs</strong><p>Shooting efficiency, rebounding, turnovers, free throws, pace, shot quality, lineup stability and possession-backed efficiency require verified event feeds.</p></div></section>`;
}
export function capHealthView(team,season='2026-27'){
 return `<section class="health-view glass"><div class="health-heading"><div><p class="eyebrow">CAP HEALTH · ${esc(team)} · ${esc(season)}</p><h2>Cap Health</h2><p>Linked to the existing Salary Cap Tower and scenario ledger.</p></div><span class="health-status">Live charges: Pending</span></div>${healthBar('Payroll completeness',null,'Pending','Verified player cap charges, dead money and holds are not fully connected.')}${healthBar('Apron flexibility',null,'Pending','Hard-cap status is conditional and is not inferred from an apron threshold.')}${healthBar('Contract concentration',null,'Pending','Requires complete multi-year contract allocations.')}</section>`;
}
export function businessHealthView(team,season='2026-27'){
 return `<section class="health-view glass"><div class="health-heading"><div><p class="eyebrow">BUSINESS / BRI HEALTH · ${esc(team)} · ${esc(season)}</p><h2>Business Health</h2><p>Authorized internal business feeds stay separate from league-wide BRI.</p></div><span class="health-status">DEMO OFF</span></div>${healthBar('Attendance',null,'Pending','No authorized team attendance feed connected.')}${healthBar('Sponsorship',null,'Pending','No internal sponsorship records connected.')}${healthBar('Merchandise & digital',null,'Pending','No authorized business dataset connected.')}<p class="health-note">A clearly labeled demo dataset can be enabled later without writing values into verified Atlas records.</p></section>`;
}
export function minutesUsageView(player,record,season='2026-27'){
 const data=playerHealthData(player,record,season),min=data.available.find(x=>x.key==='minutes'),usage=data.available.find(x=>x.key==='usage');
 return `<section class="health-view glass"><div class="health-heading"><div><p class="eyebrow">MINUTES & USAGE · ${esc(player.name)} · ${esc(season)}</p><h2>Minutes & Usage Health</h2><p>Actual game logs are required for rolling 5/10/20 windows.</p></div><span class="health-status">${data.sample?`${data.sample} sourced games`:'Game logs unavailable'}</span></div>${healthBar('Season minutes',min?70:null,min?`${min.item.value.toFixed(1)} per game`:'Pending',min?`Source checked ${sourceDate(min.item)}`:'Game-by-game minutes unavailable')}${healthBar('Usage',usage?65:null,usage?`${(usage.item.value*100).toFixed(1)}%`:'Pending',usage?`Source checked ${sourceDate(usage.item)}`:'Usage methodology or game logs unavailable')}<div class="health-missing"><strong>Rolling workload chart</strong><p>Game logs unavailable. No historical bars are generated outside DEMO MODE.</p></div></section>`;
}
export function developmentView(player,record,season='2026-27'){
 const data=playerHealthData(player,record,season),focus=data.pending[0]||'role strength';
 return `<section class="health-view glass"><div class="health-heading"><div><p class="eyebrow">DEVELOPMENT PLANNER · ${esc(player.name)}</p><h2>Development</h2><p>Recommendations are coaching working notes, not promises of improvement or playing time.</p></div></div><label class="health-select">FOCUS<select data-health-focus><option value="${esc(focus)}">${esc(focus)}</option><option>shooting</option><option>decision making</option><option>defensive positioning</option><option>rebounding</option></select></label><div class="health-plan-grid">${[['10 MIN','Film review and one measurable cue'],['30 MIN','Guided reps with a retest target'],['60 MIN','Position-specific practice block'],['120 MIN','Integrated team-context session']].map(([time,copy])=>`<article><strong>${time}</strong><p>${copy}</p><small>Evidence: ${data.available.length?`${data.available.length} sourced metrics`:'source data pending'} · next checkpoint pending</small></article>`).join('')}</div></section>`;
}
