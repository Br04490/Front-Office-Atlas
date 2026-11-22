import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getSkillCornerPlayerId, selectSkillCornerEvents, type SkillCornerGame } from '../src/services/skillcorner';

const game: SkillCornerGame = JSON.parse(readFileSync(
  new URL('../data/video-studio/skillcorner/data/matches/184439/184439_dynamic_events.json', import.meta.url),
  'utf8',
));

test('only explicitly verified NBA IDs match SkillCorner players', () => {
  assert.equal(getSkillCornerPlayerId('203458'), 34832);
  assert.equal(getSkillCornerPlayerId('1626168'), 34838);
  assert.equal(getSkillCornerPlayerId('unknown'), undefined);
  assert.equal(getSkillCornerPlayerId('__proto__'), undefined);
  assert.equal(getSkillCornerPlayerId(null), undefined);
});

test('selects each matched player’s actual game events', () => {
  const len = selectSkillCornerEvents(game, 34832);
  const lyles = selectSkillCornerEvents(game, 34838);
  assert.equal(len.shots.length, 4);
  assert.equal(len.shots.filter((shot) => shot.outcome).length, 2);
  assert.equal(len.shots.filter((shot) => !shot.outcome && shot.fouled).length, 1);
  assert.equal(len.screens, 9);
  assert.equal(len.drives, 0);
  assert.equal(lyles.shots.length, 7);
  assert.equal(lyles.shots.filter((shot) => shot.outcome).length, 3);
  assert.equal(lyles.screens, 5);
  assert.equal(lyles.drives, 2);
  assert.deepEqual(selectSkillCornerEvents(game, -1), { shots: [], screens: 0, drives: 0 });
});
