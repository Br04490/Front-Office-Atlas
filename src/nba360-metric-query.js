import {normalizeAtlas} from './atlas-query-engine.js';

const aliases=[
  ['points',/\b(?:points|pts|scoring|ppg)\b/],['rebounds',/\b(?:rebounds|boards|rpg)\b/],
  ['assists',/\b(?:assists|apg)\b/],['minutes',/\b(?:minutes|mpg)\b/],
  ['tsPct',/\b(?:true shooting|ts percentage|ts pct|ts%)\b/],
  ['efgPct',/\b(?:effective field goal|efg|effective fg)\b/],
  ['threePct',/\b(?:three point percentage|3 point percentage|three percentage|3pt percentage)\b/],
  ['netRating',/\bnet rating\b/],['games',/\b(?:games played|games)\b/]
];
const rateKeys=new Set(['tsPct','efgPct','threePct']);
export function queryNbaMetrics(raw,players,teams,intelligence){
  const text=normalizeAtlas(raw).replace(/\bts\s+percent\b/,'ts percentage');
  const found=aliases.find(([,pattern])=>pattern.test(text));
  if(!found)return null;
  const [field]=found;
  const season=text.match(/\b20\d{2}\s*2\d\b/)?.[0]?.replace(' ','-')||'2026-27';
  const number=text.match(/\b(?:at least|over|above|more than|greater than|under|below|less than|at most)\s+(\d+(?:\.\d+)?)\s*(percent|%)?/);
  const threshold=number?Number(number[1])*(rateKeys.has(field)&&(number[2]||Number(number[1])>1)?0.01:1):null;
  const operator=number?(/\b(?:under|below|less than)\b/.test(number[0])?'lt':/\bat most\b/.test(number[0])?'lte':/\b(?:over|above|more than|greater than)\b/.test(number[0])?'gt':'gte'):null;
  const matchedTeam=teams.find(team=>[team.name,team.abbr,team.name.split(' ').at(-1)].some(alias=>` ${text} `.includes(` ${normalizeAtlas(alias)} `)));
  const eligible=players.filter(player=>!matchedTeam||player.team===matchedTeam.abbr);
  const measured=eligible.map(player=>({player,metric:intelligence?.players?.[player.nbaPlayerId]?.seasons?.[season]?.metrics?.[field]})).filter(row=>Number.isFinite(row.metric?.value));
  const compare=value=>!operator||operator==='lt'&&value<threshold||operator==='lte'&&value<=threshold||operator==='gt'&&value>threshold||operator==='gte'&&value>=threshold;
  const matches=measured.filter(row=>compare(row.metric.value)).sort((a,b)=>b.metric.value-a.metric.value||a.player.name.localeCompare(b.player.name));
  const query={intent:'search_players',competition:'NBA',filters:[...(matchedTeam?[{field:'team',operator:'eq',value:matchedTeam.abbr}]:[]),{field,operator:operator||'available',value:threshold??season}],raw,source:'BoxScore Lab season totals'};
  const status=measured.length?'ok':'insufficient_data';
  const label=field==='tsPct'?'true shooting':field==='efgPct'?'effective field goal percentage':field.replace(/([A-Z])/g,' $1').toLowerCase();
  return {kind:status==='ok'?(matches.length?'players':'none'):'coverage',status,summary:status==='ok'?`${matches.length} players match ${label}${operator?` ${operator} ${number[1]}${rateKeys.has(field)?'%':''}`:''} in ${season}. ${measured.length} of ${eligible.length} roster players have this metric. Source: BoxScore Lab season totals, verified 2026-11-16.`:`No verified ${label} values for ${season} in the selected roster.`,players:matches.map(row=>row.player),metricRows:matches.map(row=>({nbaPlayerId:row.player.nbaPlayerId,value:row.metric.value,unit:row.metric.unit,source:row.metric.source})),teams:[],query,missing:status==='ok'?[]:[field]};
}
