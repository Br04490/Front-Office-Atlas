import test from 'node:test';
import assert from 'node:assert/strict';
import {watermarkContext} from '../src/watermark-controller.js';
import {teams} from '../src/data/teams.js';
test('global pages never inherit the default Houston franchise watermark',()=>{for(const page of ['home','directory','workspace'])assert.deepEqual(watermarkContext({page,team:'HOU'},{context:null},{returnContext:null}),{kind:'league',team:null})});
test('all 30 franchise pages use their selected local logo',()=>{for(const team of teams)assert.deepEqual(watermarkContext({page:'team',team:team.abbr},{context:null},{}),{kind:'team',team:team.abbr})});
test('a profile carries team identity only when opened from a team page',()=>{assert.deepEqual(watermarkContext({page:'player',team:'HOU'},{context:null},{returnContext:{state:{page:'team',team:'ORL'}}}),{kind:'team',team:'ORL'});assert.deepEqual(watermarkContext({page:'player',team:'HOU'},{context:null},{returnContext:{state:{page:'workspace',team:'HOU'}}}),{kind:'league',team:null})});
test('explicit workspace franchise context overrides league mark',()=>assert.deepEqual(watermarkContext({page:'workspace',team:'HOU'},{context:'OKC'},{}),{kind:'team',team:'OKC'}));
