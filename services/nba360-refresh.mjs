import {openWarehouse,defaultDatabase} from '../data-pipeline/src/warehouse.mjs';
import {pollBdlScores} from '../data-pipeline/src/bdl-score-sync.mjs';

let running=false;
export function startNbaScoreRefresh(){
  if(!process.env.BDL_API_KEY)return {status:'awaiting_key'};
  const refresh=async()=>{
    if(running)return;
    running=true;
    const db=openWarehouse(defaultDatabase);
    try{const result=await pollBdlScores(db,{apiKey:process.env.BDL_API_KEY});console.log('NBA score refresh',JSON.stringify(result))}
    catch(error){console.error('NBA score refresh failed:',error.message)}
    finally{db.close();running=false}
  };
  void refresh();
  const timer=setInterval(refresh,15*60*1000);
  timer.unref();
  return {status:'scheduled',intervalMinutes:15,source:'BALLDONTLIE free games endpoint'};
}
