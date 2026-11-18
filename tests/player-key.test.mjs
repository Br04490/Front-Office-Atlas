import test from 'node:test';
import assert from 'node:assert/strict';
import {playerKey,parsePlayerKey} from '../src/player-key.js';
import {openProfile,profileState} from '../src/components/player-profile.js';
test('league-aware keys preserve NBA IDs and distinguish external providers',()=>{
 assert.deepEqual(parsePlayerKey(1630578),{key:'NBA:1630578',league:'NBA',provider:'nba',id:'1630578',nbaPlayerId:1630578});
 assert.equal(playerKey('NCAA_D1','school','abc-9'),'NCAA_D1:school:abc-9');
 assert.equal(parsePlayerKey('G_LEAGUE:official:2468').nbaPlayerId,null);
 assert.notEqual(playerKey('NCAA_D1','school','2468'),playerKey('G_LEAGUE','official','2468'));
 assert.throws(()=>parsePlayerKey('NCAA_D1:missing'),/Invalid/);
});
test('NBA profile navigation retains numeric ID while storing canonical key',()=>{
 openProfile(1630578);assert.equal(profileState.playerId,1630578);assert.equal(profileState.playerKey,'NBA:1630578');
 openProfile('NCAA_D1:school:abc-9');assert.equal(profileState.playerId,null);assert.equal(profileState.playerKey,'NCAA_D1:school:abc-9');
});
