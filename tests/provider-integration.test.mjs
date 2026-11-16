import test from 'node:test';
import assert from 'node:assert/strict';
import snapshot from '../src/data/provider-snapshot.json' with {type:'json'};
import {providerCatalog} from '../src/data/provider-catalog.js';
import {validateProvider,providerAccess,providerById} from '../src/provider-registry.js';
import {createAdapter} from '../src/provider-adapters.js';
import {validateSnapshot,resolveIdentity,metricValue,leaderboard,searchEvents,evaluateFormula,customLeaderboard,canPlayFilm,validateFilmAsset,researchMetrics} from '../src/provider-model.js';

test('catalog manifests are unique, sourced, and truthful about access',()=>{
 assert.equal(new Set(providerCatalog.map(p=>p.providerId)).size,providerCatalog.length);
 for(const provider of providerCatalog)assert.deepEqual(validateProvider(provider),[],provider.providerId);
 assert.equal(providerCatalog.filter(p=>['connected','partially_connected'].includes(p.status)).length,1);
 assert.equal(providerAccess(providerById('shottracker'),'metrics').allowed,false);
 assert.equal(providerAccess(providerById('synergy'),'film').allowed,false);
 assert.equal(providerAccess(providerById('skillcorner'),'film').allowed,false);
});
test('adapter surface separates documentation from operational access',async()=>{
 const skill=createAdapter('skillcorner'),shot=createAdapter('shottracker');
 assert.equal((await skill.testConnection()).connected,true);
 assert.equal((await shot.testConnection()).connected,false);
 assert.equal((await shot.validateConfiguration()).valid,false);
 assert.deepEqual((await shot.listAvailableDatasets()),[]);
 assert.equal((await skill.listAvailableDatasets())[0].competition,'Liga ACB');
});
test('pinned SkillCorner snapshot preserves source identity and joins',()=>{
 assert.deepEqual(validateSnapshot(snapshot),[]);
 assert.equal(snapshot.players.length,323);
 assert.equal(snapshot.games.length,1);
 assert.equal(snapshot.possessions.length,151);
 assert.equal(snapshot.events.length,368);
 assert.equal(snapshot.trackingFrames.length,88);
 assert.equal(snapshot.filmAssets.length,0);
 assert.equal(resolveIdentity(snapshot,{providerId:'nba',playerId:446,competition:'NBA',season:'2026-27'}).length,0);
 assert.ok(resolveIdentity(snapshot,{providerId:'skillcorner',playerId:446,competition:'Liga ACB',season:'2025-2026'}).length>0);
});
test('real metrics and event search retain provider lineage',()=>{
 const first=leaderboard(snapshot,'shot_points_per_attempt',{minimumAttempts:20,limit:1})[0];
 assert.ok(first.metric.value>0);
 assert.equal(first.metric.sourceCommit,snapshot.sourceCommit);
 assert.equal(first.metric.sourceMetricId,'points_per_shot');
 assert.equal(metricValue(first.player,'shot_points_per_attempt',snapshot).license,'MIT');
 const shots=searchEvents(snapshot,{type:'shot'});
 assert.equal(shots.length,139);
 assert.ok(snapshot.possessions.some(x=>x.id===shots[0].possessionId));
 assert.equal(shots[0].videoAssetId,null);
});
test('custom formula uses only permitted numeric fields and validates units',()=>{
 const player=leaderboard(snapshot,'shot_points_per_attempt',{minimumAttempts:20,limit:1})[0].player;
 const result=evaluateFormula('shot_total_points / shot_attempts',player,snapshot);
 assert.equal(result.unit,'points / attempts');
 assert.equal(result.value,player.metrics.shot_total_points.value/player.metrics.shot_attempts.value);
 assert.deepEqual(result.sourceMetricIds,['shot_total_points','shot_attempts']);
 assert.throws(()=>evaluateFormula('shot_attempts + shot_total_points',player,snapshot),/Incompatible units/);
 assert.throws(()=>evaluateFormula('process.exit()',player,snapshot),/Unsupported formula character/);
 const board=customLeaderboard(snapshot,'shot_total_points / shot_attempts');
 assert.ok(board.eligible>20);
 assert.ok(board.rows[0].result.value>=board.rows[1].result.value);
});
test('film metadata never grants playback on its own and research metrics remain unpopulated',()=>{
 const asset={id:'test',providerId:'skillcorner',gameId:'skillcorner:114086',playbackRights:'external_link',url:'https://example.org/clip'};
 assert.deepEqual(validateFilmAsset(asset),[]);
 assert.equal(canPlayFilm(asset),false);
 assert.equal(researchMetrics.length,11);
 assert.ok(researchMetrics.every(x=>x.draftEquation&&x.values===0&&x.validation==='not validated'));
});
