const clone=value=>structuredClone(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function mergeNode(current,incoming,path){
 if(current===undefined)return clone(incoming);
 if(incoming===undefined)return clone(current);
 if(Array.isArray(current)&&Array.isArray(incoming)){
  const out=clone(current);
  for(const item of incoming)if(!out.some(existing=>same(existing,item)))out.push(clone(item));
  return out;
 }
 if(current&&incoming&&typeof current==='object'&&typeof incoming==='object'&&!Array.isArray(current)&&!Array.isArray(incoming)){
  const out={};for(const key of new Set([...Object.keys(current),...Object.keys(incoming)]))out[key]=mergeNode(current[key],incoming[key],`${path}.${key}`);
  return out;
 }
 if(same(current,incoming))return clone(current);
 throw Error(`Conflicting source values at ${path}`);
}

export function mergePlayerIntelligence(current,incoming){
 if(current.schemaVersion!==1||incoming.schemaVersion!==1)throw Error('Unsupported player-intelligence schema');
 if(incoming.rights?.authorizedForAtlas!==true||!incoming.rights?.basis||!incoming.rights?.sourceUrl)throw Error('Incoming source rights not verified');
 const shotKey=shot=>`${shot.playerId}:${shot.season}:${shot.gameId}:${shot.gameEventId}`;
 const shots=new Map((current.shotEvents||[]).map(shot=>[shotKey(shot),clone(shot)]));
 for(const shot of incoming.shotEvents||[]){const key=shotKey(shot);if(shots.has(key)&&!same(shots.get(key),shot))throw Error(`Conflicting shot event ${key}`);shots.set(key,clone(shot))}
 const sources=[...(current.sourceImports||[]),...(current.rights?[current.rights]:[]),incoming.rights];
 const uniqueSources=[...new Map(sources.map(source=>[`${source.sourceUrl}|${source.basis}`,source])).values()];
 return {schemaVersion:1,description:current.description||incoming.description,rights:current.rights||incoming.rights,sourceImports:uniqueSources,players:mergeNode(current.players||{},incoming.players||{},'players'),shotEvents:[...shots.values()],contracts:mergeNode(current.contracts||{},incoming.contracts||{},'contracts'),allocationCoverage:mergeNode(current.allocationCoverage||{},incoming.allocationCoverage||{},'allocationCoverage'),metricDefinitions:mergeNode(current.metricDefinitions||{},incoming.metricDefinitions||{},'metricDefinitions'),leagueZoneBaselines:mergeNode(current.leagueZoneBaselines||{},incoming.leagueZoneBaselines||{},'leagueZoneBaselines'),importedAt:new Date().toISOString()};
}
