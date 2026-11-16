export function watermarkContext(state,workspaceState,profileState){
 if(state.page==='team')return {kind:'team',team:state.team};
 if(state.page==='player'&&profileState.returnContext?.state?.page==='team')return {kind:'team',team:profileState.returnContext.state.team};
 if(state.page==='workspace'&&workspaceState.context)return {kind:'team',team:workspaceState.context};
 return {kind:'league',team:null};
}
export function updateWatermark(context){let layer=document.querySelector('#atlas-watermark');if(!layer){layer=document.createElement('div');layer.id='atlas-watermark';layer.setAttribute('aria-hidden','true');layer.innerHTML='<div class="atlas-watermark-league"><div class="nba-silhouette nba-silhouette-glow"></div><div class="nba-silhouette nba-silhouette-figure"></div></div><div class="atlas-watermark-team"><img alt=""></div>';document.body.prepend(layer)}const teamImage=layer.querySelector('.atlas-watermark-team img');if(context.kind==='team'&&context.team){const target=`./src/assets/logos/${context.team}.png`;if(teamImage.getAttribute('src')!==target)teamImage.setAttribute('src',target)}layer.dataset.context=context.kind;layer.dataset.team=context.team||''}
