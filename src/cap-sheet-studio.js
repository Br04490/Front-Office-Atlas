import {financialView,thresholdDistance} from './financial-model.js';
import {financialSources} from './data/financial-sources.js';
import {scenarioState,proposedRoster} from './roster-scenario.js';
import {teams} from './data/teams.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const usd=value=>Number.isSafeInteger(value)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value):'Pending';
const cell=(value,label)=>/Standard roster players (priced|missing)/.test(label)?Number.isSafeInteger(value)?String(value):'Pending':usd(value);
export const capSheetTypes=[
 ['roster','Team roster and salary master'],['contracts','Multiyear contract sheet'],['cap','Salary-cap worksheet'],['tax','Luxury-tax worksheet'],['firstApron','First-apron worksheet'],['secondApron','Second-apron worksheet'],['trade','Trade-matching worksheet'],['freeAgency','Free-agency and exceptions worksheet'],['waivers','Waivers and dead-money worksheet'],['twoWay','Two-way and G League worksheet'],['draft','Draft asset ledger'],['transactions','Transaction reconciliation sheet'],['approvals','Approval and document ledger'],['bri','BRI and future cap projection'],['calendar','Contract guarantee and option calendar']
];
export const capSheetState={type:'cap',team:'HOU',season:'2026-27'};
const row=(label,before,after,source='',note='')=>({label,before,after,delta:Number.isSafeInteger(before)&&Number.isSafeInteger(after)?after-before:null,source,note});
export function buildCapSheet({players,team,season,type,sources=financialSources,scenario=scenarioState.current}){
 if(!capSheetTypes.some(([key])=>key===type))throw Error('Unknown cap sheet');
 const original=players.filter(player=>player.team===team),proposed=scenario?.team?proposedRoster(players,team):original;
 const baseline=financialView({players:original,teamAbbr:team,season,mode:'cap',sources});
 const candidate=financialView({players:proposed,teamAbbr:team,season,mode:'cap',sources,scenario});
 const t=sources.thresholds?.[season],source=t?.source||'',rows=[];
 const add=(label,before,after=before,note='',sourceUrl='')=>rows.push(row(label,before,after,sourceUrl,note));
 if(type==='roster'||type==='contracts'||type==='calendar'){
  for(const player of original){const record=sources.contracts?.[player.nbaPlayerId]?.[season];const valid=record?.team===team&&record.source&&record.verifiedAt&&Number.isSafeInteger(record.cap);rows.push(row(`${player.name} · NBA ${player.nbaPlayerId}`,valid?record.cap:null,proposed.some(item=>item.nbaPlayerId===player.nbaPlayerId)&&valid?record.cap:null,valid?record.source:'',valid?`Contract ${record.contractType||'type pending'} · verified ${record.verifiedAt}`:'Verified cap charge missing'));}
  for(const player of proposed.filter(player=>!original.some(item=>item.nbaPlayerId===player.nbaPlayerId)))rows.push(row(`${player.name} · NBA ${player.nbaPlayerId}`,null,null,'','Incoming contract treatment requires reconciliation'));
 }
 if(['cap','tax','firstApron','secondApron','roster','contracts'].includes(type)){
  add('Standard roster players priced',baseline.priced.length,candidate.priced.length,'Count is not a payroll total');
  add('Standard roster players missing cap charges',baseline.unpriced.length,candidate.unpriced.length,'Incomplete coverage blocks team salary');
  add('Player cap charges subtotal',baseline.unpriced.length?null:baseline.knownPlayerTotal,candidate.unpriced.length?null:candidate.knownPlayerTotal,'Excludes non-player charges');
  rows.push(row('Reconciled team salary',baseline.total,candidate.total,'','Requires complete contracts and attested non-player allocations'));
 }
 if(['cap','tax','firstApron','secondApron','bri'].includes(type)){
  for(const [key,label] of [['minimum','Minimum team salary'],['cap','NBA salary cap'],['tax','Luxury tax'],['firstApron','First apron'],['secondApron','Second apron']])add(label,t?.[key]??null,t?.[key]??null,'Official league threshold',source);
  if(type!=='bri')add(`Distance to ${type==='cap'?'NBA salary cap':type==='tax'?'luxury tax':type==='firstApron'?'first apron':'second apron'}`,thresholdDistance(baseline.total,t?.[type]),thresholdDistance(candidate.total,t?.[type]),'Positive means below the threshold; not necessarily usable cap room',source);
 }
 if(['trade','freeAgency','waivers','twoWay','draft','transactions','approvals','calendar','bri'].includes(type)){
  const descriptions={trade:'Trade matching requires applicable salary matching, aggregation and apron rules.',freeAgency:'Exception availability and eligibility need verified team transactions.',waivers:'Guaranteed salary and dead money need verified contract terms.',twoWay:'Two-way and assignment status needs a dated league record.',draft:'Draft rights require a sourced rights ledger.',transactions:'Transactions require verified financial treatment and audit records.',approvals:'Internal approvals require authenticated users and a documented review trail.',calendar:'Guarantee and option dates require source-backed contracts.',bri:'Future cap values require an explicit forecast model; official future thresholds are unavailable.'};
  rows.push(row('Required operational input',null,null,'',descriptions[type]));
 }
 return {type,team,season,rows,baselineComplete:baseline.complete,scenarioComplete:candidate.complete,baselineSalary:baseline.total,scenarioSalary:candidate.total,source:source||null,scenarioRevision:scenario?.revision||0};
}
export function capSheetCsv(sheet){const q=value=>`"${String(value??'').replaceAll('"','""')}"`;return [['Team','Season','Sheet','Line','Before USD','After USD','Delta USD','Source','Note'],...sheet.rows.map(item=>[sheet.team,sheet.season,sheet.type,item.label,item.before,item.after,item.delta,item.source,item.note])].map(fields=>fields.map(q).join(',')).join('\r\n')+'\r\n'}
export function capSheetStudio(players){const team=teams.find(item=>item.abbr===capSheetState.team)||teams[0],sheet=buildCapSheet({players,team:team.abbr,season:capSheetState.season,type:capSheetState.type});return `<section class="cap-sheet-studio profile-glass"><div class="cap-sheet-head"><div><p class="eyebrow">SOURCE-AWARE FINANCIAL WORKSHEETS</p><h3>Cap Sheet Studio</h3><p>Original versus working scenario · revision ${sheet.scenarioRevision}. Missing charges remain pending.</p></div><button class="ws-small" data-cap-sheet-export="csv">Download CSV</button></div><div class="cap-sheet-controls"><label>WORKSHEET<select data-cap-sheet-field="type">${capSheetTypes.map(([key,label])=>`<option value="${key}" ${sheet.type===key?'selected':''}>${esc(label)}</option>`).join('')}</select></label><label>TEAM<select data-cap-sheet-field="team">${teams.map(item=>`<option value="${item.abbr}" ${team.abbr===item.abbr?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label><label>SEASON<select data-cap-sheet-field="season">${Object.keys(financialSources.thresholds).filter(value=>value>='2025-26').map(value=>`<option value="${value}" ${sheet.season===value?'selected':''}>${value}</option>`).join('')}</select></label></div><div class="cap-sheet-status"><strong>ORIGINAL TEAM SALARY: ${usd(sheet.baselineSalary)}</strong><strong>SCENARIO TEAM SALARY: ${usd(sheet.scenarioSalary)}</strong><span>Source-backed threshold: ${sheet.source?`<a href="${esc(sheet.source)}" target="_blank" rel="noopener noreferrer">NBA release ↗</a>`:'Pending'}</span></div><div class="contract-table-wrap"><table class="contract-table"><thead><tr><th>Line</th><th>Before</th><th>After</th><th>Delta</th><th>Source / missing input</th></tr></thead><tbody>${sheet.rows.map(item=>`<tr><td>${esc(item.label)}</td><td>${cell(item.before,item.label)}</td><td>${cell(item.after,item.label)}</td><td>${cell(item.delta,item.label)}</td><td>${item.source?`<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:esc(item.note||'Pending')}</td></tr>`).join('')}</tbody></table></div><p class="ws-disclaimer">CSV is an export, not the live financial database. A roster move alone does not prove legal cap relief. XLSX formulas and PDF export are pending.</p></section>`}
