// Independent Atlas comparison. It is not a licensed provider similarity grade.
const specs=[['points',.25,35],['rebounds',.18,15],['assists',.18,12],['minutes',.14,40],['tsPct',.15,.25],['usage',.10,.35]];
const valid=item=>item&&Number.isFinite(item.value)&&/^https:\/\//.test(item.source||'')&&item.verifiedAt;
export function statisticalTwins(anchor,players,intelligence,season,{limit=5,minGames=8,positionOnly=false}={}){
  const source=intelligence?.players?.[anchor.nbaPlayerId]?.seasons?.[season]?.metrics||{};
  const anchorGames=source.games?.value;
  if(!Number.isFinite(anchorGames)||anchorGames<minGames)return {status:'insufficient_data',reason:`Selected player needs at least ${minGames} sourced games in ${season}.`,pool:0,matches:[]};
  const keys=specs.filter(([key])=>valid(source[key]));
  if(keys.length<specs.length)return {status:'insufficient_data',reason:'All six sourced performance measures are required for this Atlas formula.',pool:0,matches:[]};
  const candidates=players.filter(player=>player.nbaPlayerId!==anchor.nbaPlayerId).map(player=>{
    if(positionOnly&&player.position!==anchor.position)return null;
    const metrics=intelligence?.players?.[player.nbaPlayerId]?.seasons?.[season]?.metrics||{};
    if(!Number.isFinite(metrics.games?.value)||metrics.games.value<minGames||!keys.every(([key])=>valid(metrics[key])))return null;
    let weightedError=0,weight=0;
    const differences=keys.map(([key,w,scale])=>{
      const a=source[key].value,b=metrics[key].value;
      weightedError+=w*Math.min(1,Math.abs(a-b)/scale);weight+=w;
      return {key,anchor:a,peer:b,unit:source[key].unit,source:metrics[key].source,verifiedAt:metrics[key].verifiedAt};
    });
    return {player,score:Math.round(100*(1-weightedError/weight)),differences,games:metrics.games.value,source:metrics.games.source};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.player.name.localeCompare(b.player.name));
  return {status:'ok',pool:candidates.length,matches:candidates.slice(0,limit),method:'Atlas v1: weighted capped absolute differences in PPG (25%), RPG (18%), APG (18%), MPG (14%), TS% (15%), usage (10%). Each difference is divided by a fixed published scale; missing values exclude the candidate. No pace, role or era adjustment.'};
}
