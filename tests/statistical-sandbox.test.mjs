import test from 'node:test';
import assert from 'node:assert/strict';
import { rankPlayers, statisticalSandbox } from '../src/components/statistical-sandbox.js';

const metric = value => ({value,source:'https://example.org/season',verifiedAt:'2026-11-16',unit:'fraction'});
const rows = [[1,.6,50],[2,.5,100],[3,null,300]].map(([id,rate,attempts])=>({
  player:{nbaPlayerId:id,team:'UTA',name:'Player '+id},
  metrics:{tsPct:metric(rate),fieldGoalAttempts:metric(attempts)}
}));
test('rate and action rankings use sourced measurements and exclude missing criteria',()=>{
  assert.deepEqual(rankPlayers(rows,['tsPct'],'Best rate').map(r=>r.player.nbaPlayerId),[1,2]);
  assert.deepEqual(rankPlayers(rows,['tsPct'],'Most actions').map(r=>r.player.nbaPlayerId),[2,1]);
  assert.deepEqual(rankPlayers(rows,['high_ball_screen'],'Combined fit'),[]);
});
test('the active franchise renders a single empty board before criteria are selected',()=>{
  const players=rows.map(r=>r.player);
  const intelligence={players:Object.fromEntries(rows.map(r=>[r.player.nbaPlayerId,{seasons:{'2026-27':{metrics:r.metrics}}}]))};
  const html=statisticalSandbox({name:'Utah Jazz',abbr:'UTA',logo:'UTA.png'},players,intelligence,'2026-27');
  assert.equal(html.match(/class="query-center"/g).length,1);
  assert.equal((html.match(/class="query-wire"/g)||[]).length,0);
  assert.equal((html.match(/class="query-face"/g)||[]).length,0);
  assert.match(html,/Drag or select a metric/);
});
