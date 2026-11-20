const leagues=new Set(['NBA','NCAA_D1','G_LEAGUE','GRASSROOTS_BOYS','OVERSEAS_MEN']);
export function playerKey(league,provider,id){
 if(!leagues.has(league)||!String(id??'').trim())throw Error('A supported league and player ID are required');
 if(league==='NBA'){
  if(!/^\d+$/.test(String(id))||Number(id)<=0)throw Error('NBA player ID must be positive numeric');
  return `NBA:${id}`;
 }
 if(!/^[a-z0-9_-]+$/i.test(String(provider??''))||!String(id).trim()||String(id).includes(':'))throw Error('External player identity needs a safe provider and ID');
 return `${league}:${provider}:${id}`;
}
export function parsePlayerKey(value){
 const key=typeof value==='number'||/^\d+$/.test(String(value??''))?`NBA:${value}`:String(value??'');
 const parts=key.split(':');
 if(parts[0]==='NBA'&&parts.length===2&&/^\d+$/.test(parts[1])&&Number(parts[1])>0)return {key,league:'NBA',provider:'nba',id:parts[1],nbaPlayerId:Number(parts[1])};
 if(parts.length===3&&['NCAA_D1','G_LEAGUE','GRASSROOTS_BOYS','OVERSEAS_MEN'].includes(parts[0])&&/^[a-z0-9_-]+$/i.test(parts[1])&&parts[2])return {key,league:parts[0],provider:parts[1],id:parts[2],nbaPlayerId:null};
 throw Error('Invalid league-aware player key');
}
