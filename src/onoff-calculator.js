// Only counted, identified team possessions may enter this calculation.
export function calculateOnOff(possessions,{nbaPlayerId,team,season}){
  const seen=new Set;
  const totals={on:{for:0,against:0,offensivePossessions:0,defensivePossessions:0},off:{for:0,against:0,offensivePossessions:0,defensivePossessions:0}};
  for(const row of possessions){
    if(row.team!==team||row.season!==season)continue;
    const identity=`${row.gameId}:${row.possessionId}`;
    if(seen.has(identity))throw Error(`Duplicate possession ${identity}`);
    seen.add(identity);
    if(!/^\d{10}$/.test(row.gameId||'')||!Number.isInteger(row.possessionId)||!['offense','defense'].includes(row.side)||!Number.isInteger(row.points)||row.points<0||row.points>4||!Array.isArray(row.onCourtPlayerIds)||!/^https:\/\//.test(row.source||''))throw Error(`Invalid sourced possession ${identity}`);
    const side=row.onCourtPlayerIds.includes(nbaPlayerId)?'on':'off';
    if(row.side==='offense'){totals[side].for+=row.points;totals[side].offensivePossessions++}
    else{totals[side].against+=row.points;totals[side].defensivePossessions++}
  }
  const rates=side=>{const item=totals[side];return {possessions:item.offensivePossessions+item.defensivePossessions,offensivePossessions:item.offensivePossessions,defensivePossessions:item.defensivePossessions,offensiveRating:item.offensivePossessions?100*item.for/item.offensivePossessions:null,defensiveRating:item.defensivePossessions?100*item.against/item.defensivePossessions:null,netRating:item.offensivePossessions&&item.defensivePossessions?100*item.for/item.offensivePossessions-100*item.against/item.defensivePossessions:null}};
  const on=rates('on'),off=rates('off');
  return {on,off,netDifference:on.netRating!=null&&off.netRating!=null?on.netRating-off.netRating:null,season,team,sample:seen.size};
}
