import { pools, scopes, uid, scoutFeeds, loadScout, buildRows, sampleMetric, ringPositions } from '../sandbox-scope.js';
import { library } from '../data/sandbox-library.js';
import { playerPhoto, escapePlayerText as esc } from './player-photo.js';

const categories = ['All','Basic stats','Play Types','Tracking','Shooting','Impact','Contracts','Defense','Workload','Clutch','More'];
const views = ['Query Circle','Flow','Scatter','Charts','Table','Film'];
const aliases = { ts:'tsPct', efg:'efgPct', turnover_pct:'turnoverPct', usage:'usage', minutes:'minutes' };
const teamSessions = new Map();
const fmt = m => m.unit === 'fraction' ? (100*m.value).toFixed(1)+'%' : Number(m.value.toFixed(2)).toLocaleString()+' '+(m.unit||'');
const valid = item => Number.isFinite(item?.value) && item.verifiedAt && /^https:\/\//.test(item.source);
const button = (label,action,value='',active=false) => `<button type="button" class="q-toggle ${active?'active':''}" data-sb="${action}" data-value="${esc(value)}">${esc(label)}</button>`;

function fresh(season='2026-27') {
  return {ids:[],applied:[],category:'All',search:'',view:views[0],mode:'Combined fit',scope:'TEAM',statSeason:season,lines:true,demo:false,pool:'NCAA_D1',year:season,limit:5,minimum:1,window:'Season',weights:{},limits:{}};
}
function session(key,season) {
  if(!teamSessions.has(key))teamSessions.set(key,fresh(season));
  return teamSessions.get(key);
}
// Percent rank over the eligible cohort. Equal measurements share the midpoint
// of their occupied ranks; a one-player or all-tied cohort scores 50.
function percentileMap(values) {
  const sorted=values.sort((a,b)=>a-b), ranks=new Map();
  for(let start=0;start<sorted.length;){
    let end=start+1;
    while(end<sorted.length&&sorted[end]===sorted[start])end++;
    ranks.set(sorted[start],sorted.length===1?50:50*(start+end-1)/(sorted.length-1));
    start=end;
  }
  return ranks;
}
const basic=[
  ['points','Points per game (PPG)','PPG'],['rebounds','Rebounds per game (RPG)','RPG'],
  ['assists','Assists per game (APG)','APG'],['stealsPerGame','Steals per game (SPG)','SPG'],
  ['blocksPerGame','Blocks per game (BPG)','BPG'],['threePct','Three-point percentage (3P%)','3P%'],
  ['fgPct','Field goal percentage (FG%)','FG%'],['ftPct','Free throw percentage (FT%)','FT%'],
  ['minutes','Minutes per game (MPG)','MPG'],['turnoversPerGame','Turnovers per game (TOV/G)','TOV/G'],
  ['tsPct','True shooting percentage (TS%)','TS%']
];
const shortNames=new Map(basic.map(([k,,name])=>[k,name]));
const lowerBetter=new Set(['turnoverPct','turnovers','turnoversPerGame','defensiveRating','lineup-defense','defrtg']);
const displayValue=m=>m.unit==='fraction'?100*m.value:m.value;

export function prepareMatches(rows,keys,mode,{demo=false,target=[],limits=[]}={}) {
  if(!keys.length)return [];
  const volumes={tsPct:'fieldGoalAttempts',efgPct:'fieldGoalAttempts',threePct:'threePointAttempts',points:'pointsTotal',assists:'assistsTotal',rebounds:'reboundsTotal',minutes:'minutesTotal'};
  const fields=keys.map(k=>mode==='Most actions'?volumes[k]||k:k);
  const eligible=[];
  for(const row of rows){
    const metrics={...row.metrics};
    for(const k of new Set([...keys,...fields])){
      if(!valid(metrics[k])&&demo&&!shortNames.has(k)&&!protectedTerms.has(k)&&!k.startsWith('lineup-'))metrics[k]=sampleMetric(uid(row.player),k);
    }
    if(![...keys,...fields].every(k=>valid(metrics[k])||metrics[k]?.illustrative))continue;
    const passes=keys.every((k,i)=>{
      const {min,max}=limits[i]||{},m=metrics[k];
      const bound=v=>v!=null&&v!=='';
      if(m.illustrative&&(bound(min)||bound(max)))return false;
      const v=displayValue(m);
      return (!bound(min)||v>=Number(min))&&(!bound(max)||v<=Number(max));
    });
    if(passes)eligible.push({...row,metrics});
  }
  const centers=fields.map(k=>{
    if(mode!=='Team fit')return null;
    const items=(target||[]).map(row=>row.metrics[k]).filter(valid);
    return items.length?items.reduce((sum,m)=>sum+displayValue(m),0)/items.length:null;
  });
  if(mode==='Team fit'&&centers.includes(null)&&!demo)return [];
  const performance=(m,k,i)=>mode==='Team fit'&&centers[i]!=null?-Math.abs(displayValue(m)-centers[i]):displayValue(m)*(lowerBetter.has(k)?-1:1);
  const ranks=fields.map((k,i)=>percentileMap(eligible.filter(r=>valid(r.metrics[k])).map(r=>performance(r.metrics[k],k,i))));
  return eligible.map(r=>({...r,shown:r.metrics[fields[0]],demo:keys.concat(fields).some(k=>r.metrics[k]?.illustrative),
    percentiles:fields.map((k,i)=>r.metrics[k].illustrative?r.metrics[k].value:ranks[i].get(performance(r.metrics[k],k,i))) }));
}
function weightMatches(prepared,weights) {
  if(!prepared.length)return [];
  const w=prepared[0].percentiles.map((_,i)=>Math.min(100,Math.max(0,weights[i]??50)));
  const total=w.reduce((a,b)=>a+b,0);
  if(!total)return [];
  return prepared.map(r=>({...r,score:r.percentiles.reduce((n,p,i)=>n+p*w[i],0)/total}))
    .sort((a,b)=>b.score-a.score||uid(a.player).localeCompare(uid(b.player)));
}
export function rankPlayers(rows,keys,mode,options={}) {
  return weightMatches(prepareMatches(rows,keys,mode,options),options.weights||[]);
}
function weightPanel(s,entries){
  if(!s.ids.length)return '';
  return `<div class="sb-weights" aria-label="Selected metric weights">${s.ids.map(id=>{
    const m=entries.get(id),w=s.weights[id]??50,limit=s.limits[id]||{};
    const label=esc(m?.name||id),safe=esc(id);
    return `<section><header><strong>${label}</strong><button data-sb="remove" data-value="${safe}" aria-label="Remove ${label} from weights">×</button></header>
      <label>Importance <output>${w}</output><input type="range" min="0" max="100" step="1" aria-label="${label} importance" data-sb-weight="${safe}" value="${w}"></label>
      <div>${['min','max'].map(b=>`<label>${b==='min'?'Min':'Max'} <input type="number" step="any" placeholder="Any" aria-label="${label} ${b}" data-sb-limit="${safe}" data-bound="${b}" value="${esc(limit[b]??'')}"></label>`).join('')}</div></section>`;
  }).join('')}</div>`;
}
function profileAttr(p) {
  if(p.members)return 'data-sb="members" data-value="'+esc(uid(p))+'"';
  return p.pool?'data-phase1-player="'+esc(p.key)+'"':'data-player-id="'+p.nbaPlayerId+'"';
}
function network(team,s,entries,ranked) {
  const cards=ranked.slice(0,s.limit), {points,diameter}=ringPositions(cards.length);
  const xy=points.map(([x,y])=>[(x/diameter+.5)*100,(y/diameter+.5)*100]);
  const wires=s.lines?cards.map((r,i)=>`<line class="query-wire" data-wire="${esc(uid(r.player))}" style="--i:${i%10}" x1="50%" y1="50%" x2="${xy[i][0]}%" y2="${xy[i][1]}%" stroke="#62aacb"/>`).join(''):'';
  const chips=s.ids.map(id=>`<div class="q-chip"><span>${esc(entries.get(id)?.name||id)}</span><button aria-label="Remove ${esc(entries.get(id)?.name||id)}" data-sb="remove" data-value="${esc(id)}">×</button></div>`).join('');
  const board=cards.map((r,i)=>{
    const p=r.player;
    const box=['points','rebounds','assists'].map(k=>shortNames.get(k)+' '+(valid(r.metrics[k])?Number(r.metrics[k].value.toFixed(1)):'—'));
    const photos=p.members?p.members.map(m=>playerPhoto(m,'sb-mini')).join(''):playerPhoto(p,'face-portrait roster-photo');
    return `<article class="query-face" data-match="${esc(uid(p))}" style="left:${xy[i][0]}%;top:${xy[i][1]}%;--i:${i%10}"><b class="face-rank-dot">${i+1}</b><button class="face-main" ${profileAttr(p)} title="${esc(p.name)}">${p.members?'<span class="sb-five">'+photos+'</span>':photos}<span class="face-body"><small class="face-rank">${r.demo?'DEMO':'MATCH'} · ${Math.round(r.score)}/100</small><strong class="face-name">${esc(p.members?'Five-player lineup':p.name)}</strong><span class="face-val">${esc(fmt(r.shown))}</span><small class="sb-card-stats" title="Selected-window averages">${p.members?'':box.join(' · ')}</small><small class="face-role">${esc(p.team)} · ${esc(p.position||'')}</small></span></button><button class="face-film" data-sb="film" data-value="${esc(p.name)}">Film &amp; possessions</button></article>`;
  }).join('');
  return `<div class="query-stage-scroll sb-pan"><div class="query-board ${cards.length>5?'sb-expanded':''}" style="--diameter:${diameter}px"><svg class="query-wires" aria-hidden="true">${wires}</svg><div class="query-center" data-sb-drop><img src="${esc(team.logo)}" width="32" height="32" alt=""><strong class="query-title">QUERY CIRCLE</strong><small>${esc(team.name)}</small><div class="query-selected">${chips}</div>${button('Run query','run')}</div>${board}</div></div>${ranked.length>s.limit?button('Show more','more'):''}${s.member?'<p>'+esc(ranked.find(r=>uid(r.player)===s.member)?.player.name||'')+'</p>':''}`;
}
function alternate(s,ranked,keys,names) {
  if(s.view==='Film') return `<p class="top-note">${esc(s.film||'Query cohort')} · Film not connected.</p>`;
  if(!ranked.length) return '<p class="top-note">No comparable records.</p>';
  if(s.view==='Table') return `<table class="sandbox-table"><thead><tr><th>Player</th>${names.map(n=>`<th>${esc(n)}</th>`).join('')}<th>Score</th></tr></thead><tbody>${ranked.map(r=>`<tr><td><button class="q-toggle" ${profileAttr(r.player)}>${esc(r.player.name)}</button></td>${keys.map(k=>`<td>${esc(fmt(r.metrics[k]))}</td>`).join('')}<td>${Math.round(r.score)}</td></tr>`).join('')}</tbody></table>`;
  if(s.view==='Charts') return ranked.map(r=>`<div class="top-note">${esc(r.player.name)} <meter min="0" max="100" value="${r.score}"></meter> ${Math.round(r.score)}/100</div>`).join('');
  if(keys.length<2) return '<p class="top-note">Add a second connected metric and run the query to plot this comparison.</p>';
  const scatter=s.view==='Scatter', dims=scatter?keys.slice(0,2):keys;
  const norm=(r,k)=>{const vals=ranked.map(p=>p.metrics[k].value),lo=Math.min(...vals),hi=Math.max(...vals);return hi===lo?.5:(r.metrics[k].value-lo)/(hi-lo)};
  return `<svg class="graph" viewBox="0 0 640 280" role="img" aria-label="${esc(s.view)}"><path d="M45 15V240H595" stroke="#9cbccc" fill="none"/>${ranked.map(r=>{const points=dims.map((k,i)=>[45+550*i/(dims.length-1),240-220*norm(r,k)]);const title=esc(r.player.name+' · '+dims.map(k=>fmt(r.metrics[k])).join(' / '));return scatter?`<circle cx="${45+550*norm(r,dims[0])}" cy="${points[1][1]}" r="5" fill="#288db2"><title>${title}</title></circle>`:`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#318bb3" opacity=".65"><title>${title}</title></polyline>`}).join('')}</svg><small>${esc(names.slice(0,dims.length).join(' / '))} · axes scaled to the cohort minimum and maximum.</small>`;
}

const extra={
  expiring:['Contract expiration','Contracts'],playerOption:['Player option','Contracts'],teamOption:['Team option','Contracts'],rookieExpiry:['Expiring rookie-scale contract','Contracts'],extension:['Documented extension eligibility','Contracts'],cap:['Annual cap hit','Contracts'],
  'lineup-defense':['Best defensive lineups','Lineups'],'lineup-net':['Best five-man lineups','Lineups'],'lineup-pnr':['Best pick-and-roll combinations','Lineups'],'lineup-clutch':['Best late-game lineups','Lineups'],'lineup-switch':['Best lineups against switching defenses','Lineups'],'threePct':['Three-point percentage','Shooting'],onBall:['On-ball defense','Defense']
};
const protectedTerms=new Set(['expiring','playerOption','teamOption','rookieExpiry','extension','cap','lineup-defense','lineup-net']);
const opt=(key,value)=>`<option ${key===value?'selected':''} value="${esc(key)}">${esc(key||'All')}</option>`;
const select=(name,key,values,s)=>`<label>${name} <select data-sb-field="${key}">${values.map(v=>opt(v,s[key])).join('')}</select></label>`;
const input=(name,key,s,type='number')=>`<label>${name} <input data-sb-field="${key}" type="${type}" min="0" value="${esc(s[key]??'')}"></label>`;
function controls(s,team,players,phase,season) {
  const scout=s.scope==='SCOUTING',nba=s.scope==='NBA LEAGUE',lineup=s.ids.some(i=>i.startsWith('lineup-'));
  const pool=scout?(phase?.teams||[]).filter(t=>t.pool===s.pool).flatMap(t=>t.players):players;
  return `<div class="query-toggle-wrap sb-scope">${scopes.map(v=>button(v,'scope',v,s.scope===v)).join('')}${button('Demo Mode '+(s.demo?'on':'off'),'demo','',s.demo)}</div>
    <div class="sb-filters">${scout?select('Pool','pool',pools,s):select('Stat season','statSeason',['2022-23','2023-24','2024-25','2025-26','2026-27'],s)}${!scout&&!lineup?select('Game window','window',['Season','5','8','10','15','20'],s):''}${nba?select('Contract season','year',Array.from({length:12},(_,i)=>{const y=parseInt(season)-5+i;return y+'-'+String(y+1).slice(-2)}),s):''}
    ${lineup?input('Min possessions per side','minimum',s)+`<label>With player <select data-sb-field="anchor"><option value="">Any</option>${players.filter(p=>p.team===team.abbr).map(p=>`<option value="${p.nbaPlayerId}" ${s.anchor==p.nbaPlayerId?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><small>Minutes together, opponent and situation splits pending.</small>`:''}
    ${scout||nba?select('Position','position',['',...new Set(pool.map(p=>p.position).filter(Boolean))],s)+input('Age under','age',s):''}
    ${nba?input('Max cap hit ($)','capMax',s)+'<button class="q-toggle" data-workspace="cba">CBA review</button>':''}
    ${scout?select('Class','classYear',['',...new Set(pool.map(p=>p.classOrExperience).filter(Boolean))],s)+input('Min height (in)','height',s)+input('Location','geo',s,'search')+input('Projected role','role',s,'search'):''}
    </div>`;
}

let active;
export function statisticalSandbox(team,players,intelligence,season,phase={},lineups=[],cached=null) {
  const sessionSeason=season;
  const s=session(team.abbr+sessionSeason,sessionSeason);
  season=s.statSeason;
  const rows=cached?.rows??buildRows(team,players,intelligence,season,s,phase,lineups);
  const entries=cached?.entries??new Map(basic.map(([key,name])=>{const id=key==='tsPct'?'ts':key;return [id,{id,name,key,cat:'Basic stats',source:'Atlas season statistics'}]}));
  if(!cached){
  for(const [id,m] of new Map(library.map(([id,name,cat,source])=>[id,{id,name,cat,source,key:aliases[id]||id}]))){if(!entries.has(id))entries.set(id,m)}
  for(const [id,[name,cat]] of Object.entries(extra)){
    if(cat==='Lineups'&&s.scope!=='TEAM'||cat==='Contracts'&&s.scope!=='NBA LEAGUE')continue;
    if(!entries.has(id))entries.set(id,{id,name:id==='expiring'?name+' '+(parseInt(s.year)+1):name,cat,source:'Atlas',key:id});
  }
  }
  const fields=cached?.fields??new Set(rows.flatMap(r=>Object.keys(r.metrics).filter(k=>valid(r.metrics[k]))));
  for(const key of fields) if(![...entries.values()].some(m=>m.key===key))entries.set('atlas-'+key,{id:'atlas-'+key,key,name:key.replace(/([A-Z])/g,' $1'),cat:'Season stats',source:'Atlas'});
  const visible=[...entries.values()].filter(m=>(s.category==='All'||m.cat===s.category||(s.category==='More'&&!categories.includes(m.cat)))&&[m.name,m.cat,m.source].join(' ').toLowerCase().includes(s.search.toLowerCase()));
  const keys=s.ids.map(id=>entries.get(id)?.key||id),names=s.ids.map(id=>entries.get(id)?.name||id);
  const target=cached||s.mode!=='Team fit'?[]:buildRows(team,players,intelligence,season,{scope:'TEAM',ids:[],year:s.year,window:s.window},phase,[]);
  const prepared=cached?.prepared??prepareMatches(rows,keys,s.mode,{demo:s.demo,limits:s.ids.map(id=>s.limits[id]),target});
  const weights=s.ids.map(id=>s.weights[id]??50), allZero=weights.length>0&&weights.every(w=>w===0);
  const ranked=weightMatches(prepared,weights);
  const cache={rows,entries,fields,prepared};
  active={s,entries,season:sessionSeason,ranked,draw:(reuse=false)=>statisticalSandbox(team,players,intelligence,sessionSeason,phase,lineups,reuse?cache:null)};
  const visibleCount=Math.min(ranked.length,Math.max(25,s.limit));
  return `<section class="stat-workspace"><aside class="panel glass"><div class="panel-head"><b>Metric Library</b><small>${visible.length} listed</small></div><input class="search" id="sb-search" aria-label="Search metrics" placeholder="Search metrics, play types…" value="${esc(s.search)}"><div class="filter-row">${categories.map(c=>button(c,'category',c,c===s.category)).join('')}</div>${weightPanel(s,entries)}<div class="metric-list">${[...new Set(visible.map(m=>m.cat))].map(cat=>`<div class="metric-group">${esc(cat)}</div>${visible.filter(m=>m.cat===cat).map(m=>`<button type="button" draggable="true" class="metric ${s.ids.includes(m.id)?'used':''}" style="width:100%;text-align:left" data-sb="add" data-value="${esc(m.id)}"><span><span class="name">${esc(m.name)}</span><br><small class="source">${fields.has(m.key)?'Atlas season data':esc(m.source)}</small></span><small>${fields.has(m.key)?'Available':'Pending'}</small><b class="add">+</b></button>`).join('')}`).join('')||'No matching metrics'}</div></aside>
  <section class="mainpanel glass"><div class="viz-header"><strong>${esc(team.name)} · Visual Query</strong><small>${esc(season)} · Drag or select a metric to discover matching players.</small>${controls(s,team,players,phase,season)}<div class="viz-nav">${views.map(v=>button(v,'view',v,v===s.view)).join('')}</div></div><div class="query-toolbar"><div class="query-toggle-wrap"><span class="query-hint">SORT / TOGGLE</span>${['Best rate','Most actions','Combined fit','Team fit','Custom weighted fit'].map(v=>button(v,'mode',v,v===s.mode)).join('')}</div><div>${button(s.lines?'Lines on':'Lines off','lines')}${button('Clear query','clear')}</div></div>
  ${s.view==='Query Circle'?network(team,s,entries,ranked):alternate(s,ranked.slice(0,visibleCount),keys,names)}${s.view!=='Query Circle'&&s.view!=='Film'&&ranked.length>visibleCount?button('Show more results','more'):''}
  <div class="query-answer"><div><strong>${allZero?'Increase at least one metric weight to see matches.':ranked.length?'Top match · '+esc(ranked[0].player.name):s.ids.some(id=>id.startsWith('lineup-'))?'No sourced five-player combinations meet these filters':s.ids.some(id=>protectedTerms.has(id))?'No documented contract terms match this query':s.ids.length?(Number(s.window)?'Insufficient data for the selected game window':'Insufficient data or no players within the thresholds'):'Choose criteria in the library'}</strong><small class="answer-sub">${s.ids.length?(s.validated?'Full analysis · ':'Live preview · '):''}${s.demo?'Illustrative demo scores · ':''}${ranked.length} comparable results · ${esc(names.join(' / '))}</small></div></div>
  ${s.scope==='SCOUTING'?' <small>'+esc(s.pool)+' · '+esc(scoutFeeds.get(s.pool)?.status||'Roster coverage only')+' · '+rows.length+' eligible records</small>':''}
  ${s.validated?`<section class="query-answer"><div><strong>Analysis · ${esc(s.scope)} · ${esc(s.mode)}</strong><p>${ranked.length} of ${rows.length} eligible records meet the selected criteria. ${s.mode==='Team fit'?'Fit measures proximity to the active roster averages.':s.mode==='Most actions'?'Primary volume percentiles combined by importance.':s.mode==='Best rate'?'Rate percentiles combined by importance.':'Match score = sum of percentile × importance divided by total importance. Ties share a percentile. Lower turnovers score higher.'}</p>${keys.map((k,i)=>{const m=ranked[0]?.metrics[k];return '<div>'+esc(names[i])+' · '+(m?esc(fmt(m)):'Insufficient data')+(m?' · percentile '+ranked[0].percentiles[i].toFixed(1)+' · weight '+weights[i]:'')+(valid(m)?' · <a href="'+esc(m.source)+'" target="_blank" rel="noopener">Source</a> '+esc(m.verifiedAt):m?.illustrative?' · Illustrative demo scores':'')+'</div>'}).join('')}</div></section>`:''}
  <details><summary>Try the supplied interactive demo · sample data</summary><iframe loading="lazy" title="Query Circle v2 · sample data" src="./src/demo/query-circle-v2.html" style="width:100%;height:85vh;border:0"></iframe></details></section></section>`;
}
export function leaveSandbox(){
  if(active){teamSessions.clear();active=null;}
}
export function bindSandbox() {
  function redraw(weightOnly=false,reusePercentiles=weightOnly){
    const root=document.querySelector('.stat-workspace');
    if(!active||!root)return;
    const listScroll=root.querySelector('.metric-list').scrollTop;
    const prior=root.querySelector('.sb-pan');
    const offset=prior?{width:prior.scrollWidth,x:prior.scrollLeft,y:prior.scrollTop}:null;
    const old=new Map([...root.querySelectorAll('[data-match]')].map(n=>[n.dataset.match,{node:n,rect:n.getBoundingClientRect()}]));
    const previousWires=new Map([...root.querySelectorAll('[data-wire]')].map(n=>[n.dataset.wire,[parseFloat(n.getAttribute('x2')),parseFloat(n.getAttribute('y2'))]]));
    const holder=document.createElement('template');
    holder.innerHTML=active.draw(reusePercentiles===true);
    const next=holder.content.firstElementChild;
    // Reattach retained identity cards so only entrants get a staggered reveal.
    for(const candidate of next.querySelectorAll('[data-match]')){
      const retained=old.get(candidate.dataset.match)?.node;
      if(!retained)continue;
      retained.style.cssText=candidate.style.cssText;
      if(retained.innerHTML!==candidate.innerHTML)retained.replaceChildren(...candidate.childNodes);
      candidate.replaceWith(retained);
    }
    if(weightOnly===true){root.querySelector('.mainpanel').replaceWith(next.querySelector('.mainpanel'));}
    else root.replaceWith(next);
    next.querySelector('.metric-list').scrollTop=listScroll;
    const rendered=weightOnly===true?root:next;
    const pan=rendered.querySelector('.sb-pan');
    if(pan&&prior){
      pan.scrollLeft=offset&&pan.scrollWidth===offset.width?offset.x:(pan.scrollWidth-pan.clientWidth)/2;
      pan.scrollTop=offset&&pan.scrollWidth===offset.width?offset.y:(pan.scrollHeight-pan.clientHeight)/2;
    }
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    for(const n of rendered.querySelectorAll('[data-match]')){
      const prev=old.get(n.dataset.match), r=n.getBoundingClientRect();
      const dx=prev?prev.rect.left-r.left:0,dy=prev?prev.rect.top-r.top:8;
      const delay=prev?0:Math.min(8,Number(n.querySelector('b').textContent)-1)*85;
      n.animate([{translate:dx+'px '+dy+'px',opacity:prev?1:0},{translate:'0 0',opacity:1}],{duration:280,delay,fill:'backwards'});
    }
    for(const [i,w] of [...rendered.querySelectorAll('[data-wire]')].entries()){
      const from=previousWires.get(w.dataset.wire);
      if(from){
        const end=[parseFloat(w.getAttribute('x2')),parseFloat(w.getAttribute('y2'))];
        if(from.every((x,j)=>x===end[j]))continue;
        const start=performance.now();
        const move=now=>{
          if(!w.isConnected)return;
          const t=Math.min(1,(now-start)/280);
          ['x2','y2'].forEach((attr,j)=>w.setAttribute(attr,(from[j]+(end[j]-from[j])*t)+'%'));
          if(t<1)requestAnimationFrame(move);
        };
        move(start);continue;
      }
      w.setAttribute('pathLength','1');w.style.strokeDasharray='1';
      w.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:260,delay:(i%10)*85,fill:'backwards'});
    }
  }
  function act(action,value) {
    if(!active)return;
    const {s,entries,season}=active;
    switch(action){
      case 'add':
        if(!entries.has(value)||s.ids.includes(value))return;
        if(value.startsWith('lineup-'))s.ids=[];
        else if(s.ids.some(k=>k.startsWith('lineup-')))s.ids=[];
        s.ids.push(value);s.view=views[0];break;
      case 'remove': delete s.limits[value];delete s.weights[value];s.ids=s.ids.filter(id=>id!==value);break;
      case 'run': s.validated=s.ids.length>0;break;
      case 'clear': s.weights={};s.limits={};s.ids=[];s.film=null;s.member=null;break;
      case 'more': s.limit=s.view===views[0]?s.limit+5:Math.max(25,s.limit)+25;break;
      case 'demo': s.demo=!s.demo;break;
      case 'members':s.member=value;break;
      case 'scope': Object.assign(s,fresh(season),{scope:value,demo:s.demo,position:'',height:'',age:'',geo:'',classYear:'',capMax:'',role:'',anchor:'',member:null});break;
      case 'lines': s.lines=!s.lines;break;
      case 'film': s.film=value;s.view='Film';break;
      case 'category': case 'view': case 'mode': s[action]=value;break;
      default:return;
    }
    if(['add','remove','scope','clear','demo','mode'].includes(action)){s.validated=false;s.limit=5;s.film=null;s.member=null;}
    redraw();
    if(s.scope==='SCOUTING')loadScout(s.pool,redraw);
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-sb]');if(b)act(b.dataset.sb,b.dataset.value)});
  document.addEventListener('change',e=>{
    const field=e.target.dataset.sbField;
    if(!active||!field)return;
    const {s}=active;
    s[field]=field==='minimum'?Math.max(1,+e.target.value||1):e.target.value;
    s.limit=5;s.validated=false;s.film=null;s.member=null;
    redraw();
    if(field==='pool')loadScout(s.pool,redraw);
  });
  let frame=0;
  document.addEventListener('input',e=>{
    const id=e.target.dataset.sbWeight,limit=e.target.dataset.sbLimit;
    if(limit&&active){
      const s=active.s;
      (s.limits[limit]??={})[e.target.dataset.bound]=e.target.value;
      s.validated=false;s.limit=5;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{if(active?.s===s)redraw(true,false)});
      return;
    }
    if(!id||!active)return;
    const s=active.s;
    s.weights[id]=Number(e.target.value);
    s.validated=false;
    e.target.closest('label').querySelector('output').value=e.target.value;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{if(active?.s===s)redraw(true)});
  });
  document.addEventListener('input',e=>{if(e.target.id==='sb-search'){const cursor=e.target.selectionStart;active.s.search=e.target.value;redraw();const input=document.querySelector('#sb-search');input.focus();input.setSelectionRange(cursor,cursor)}});
  document.addEventListener('dragstart',e=>{const b=e.target.closest('[data-sb="add"]');if(b)e.dataTransfer.setData('application/x-atlas-metric',b.dataset.value)});
  document.addEventListener('dragover',e=>{if(e.target.closest('[data-sb-drop]'))e.preventDefault()});
  document.addEventListener('drop',e=>{if(e.target.closest('[data-sb-drop]')){e.preventDefault();act('add',e.dataTransfer.getData('application/x-atlas-metric'))}});
}
