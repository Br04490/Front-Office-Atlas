import test from 'node:test';
import assert from 'node:assert/strict';
import {campusRegion,campusRegions} from '../src/campus-region.js';
test('campus geography has six regions independent of conference',()=>{
 assert.equal(campusRegions.length,6);
 assert.equal(campusRegion('CA'),'West');
 assert.equal(campusRegion('NY'),'Northeast');
 assert.equal(campusRegion('TX'),'Southwest');
 assert.equal(campusRegion('DC'),'Mid-Atlantic');
 assert.equal(campusRegion('MX'),null);
});
