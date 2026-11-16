const normalize=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const lastName=name=>{const words=normalize(name).split(' ').filter(Boolean);while(words.length>1&&['jr','sr','ii','iii','iv'].includes(words.at(-1)))words.pop();return words.at(-1)||''};
const firstName=name=>normalize(name).split(' ')[0]||'';
const initial=(question,kind)=>{
 const pattern=kind==='last'?/(?:last|family|sur)\s*name(?:s)?/:/(?:first|given)\s*name(?:s)?/;
 const part=question.match(pattern);if(!part)return null;
 const rest=question.slice(part.index+part[0].length);
 const match=rest.match(/(?:that\s+)?(?:starts?|begins?|beginning)\s+with\s+(?:the\s+letter\s+)?([a-z])\b|(?:initial|letter)\s+([a-z])\b|^\s+(?:is\s+)?([a-z])\b/);
 return match?(match[1]||match[2]||match[3]).toUpperCase():null;
};
const teamAliases=team=>{const words=normalize(team.name).split(' ');return [normalize(team.name),normalize(team.abbr),words.at(-1),words.slice(0,-1).join(' ')].filter(x=>x&&x.length>1)};
function mentionedTeam(question,teams){const matches=[];for(const team of teams)for(const alias of teamAliases(team)){const at=` ${question} `.indexOf(` ${alias} `);if(at>=0)matches.push({team,alias,length:alias.length})}matches.sort((a,b)=>b.length-a.length);return matches[0]?.team||null}
export function queryAtlasRoster(raw,players,teams){
 const question=normalize(raw);if(!question)return {kind:'help',summary:'Ask for a player, team, or name filter. For example: Give me all players whose last name starts with R.',players:[],teams:[]};
 const last=initial(question,'last'),first=initial(question,'first'),team=mentionedTeam(question,teams);
 const roster=team?players.filter(p=>p.team===team.abbr):players;
 if(last||first){const filtered=roster.filter(p=>(last?lastName(p.name).startsWith(last.toLowerCase()):true)&&(first?firstName(p.name).startsWith(first.toLowerCase()):true)).sort((a,b)=>a.name.localeCompare(b.name));const label=[last?`last name starts with ${last}`:null,first?`first name starts with ${first}`:null,team?`on the ${team.name}`:null].filter(Boolean).join(' and ');return {kind:'players',summary:`${filtered.length} ${filtered.length===1?'player':'players'} found whose ${label}.`,players:filtered,teams:team?[team]:[]}}
 const named=question.match(/(?:last|family|sur)\s*name(?:s)?\s+(?:is|are|equals?|called)\s+([a-z]+)\b|(?:first|given)\s*name(?:s)?\s+(?:is|are|equals?|called)\s+([a-z]+)\b|\b(?:players?|people)\s+(?:named|called)\s+([a-z]+)\b/);
 if(named){const term=named[1]||named[2]||named[3];const filtered=roster.filter(p=>named[1]?lastName(p.name)===term:named[2]?firstName(p.name)===term:normalize(p.name).split(' ').includes(term)).sort((a,b)=>a.name.localeCompare(b.name));return {kind:'players',summary:`${filtered.length} ${filtered.length===1?'player':'players'} found with the name ${term}${team?` on the ${team.name}`:''}.`,players:filtered,teams:team?[team]:[]}}
 if(team){const filtered=roster.slice().sort((a,b)=>a.name.localeCompare(b.name));return {kind:'players',summary:`${team.name}: ${filtered.length} players in the loaded roster.`,players:filtered,teams:[team]}}
 const fullName=players.find(p=>` ${question} `.includes(` ${normalize(p.name)} `));
 if(fullName)return {kind:'players',summary:`${fullName.name} is listed with the ${teams.find(t=>t.abbr===fullName.team)?.name||fullName.team} in the loaded roster.`,players:[fullName],teams:[]};
 const playerName=question.replace(/^(?:give me|show me|find|search for|look up|tell me about|who is|who are|list|all|the)\s+/g,'').replace(/\b(?:players?|roster|named|called|on|from|the|team|nba)\b/g,' ').replace(/\s+/g,' ').trim();
 if(playerName){const exact=players.filter(p=>normalize(p.name)===playerName);const found=exact.length?exact:players.filter(p=>` ${normalize(p.name)} `.includes(` ${playerName} `)||normalize(p.name).split(' ').some(part=>part===playerName));if(found.length)return {kind:'players',summary:`${found.length} ${found.length===1?'player':'players'} found for “${raw.trim()}”.`,players:found.sort((a,b)=>a.name.localeCompare(b.name)),teams:[]}}
 if(/\b(?:teams|franchises)\b/.test(question))return {kind:'teams',summary:`${teams.length} NBA teams in the loaded directory.`,players:[],teams};
 return {kind:'none',summary:'No matching player or team found in the loaded roster. Try a full name, a team name, or “last name starts with R.”',players:[],teams:[]};
}
