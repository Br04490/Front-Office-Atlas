const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderRosterAggregate(result){
 if(result?.kind!=='aggregate')return '';
 const max=Math.max(1,...result.groups.map(group=>group.count));
 return `<div class="atlas-aggregate" role="group" aria-label="Roster count by ${escapeHtml(result.groupBy)}"><p>Roster snapshot · ${escapeHtml(result.groupBy)} distribution</p>${result.groups.map(group=>`<div class="atlas-aggregate-row"><span>${escapeHtml(group.label)}</span><div class="atlas-aggregate-track"><i style="width:${(100*group.count/max).toFixed(2)}%"></i></div><strong>${group.count}</strong></div>`).join('')}</div>`;
}
