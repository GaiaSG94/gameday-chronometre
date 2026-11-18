import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  binIndex,
  clockLabel,
  closerThan,
  dateLabel,
  dayInitial,
  gapWord,
  heatNumber,
  isValidTime,
  msToNextHeat,
  shiftDay,
  targetFor,
  TARGET_MAX,
  TARGET_MIN,
  windowDays,
} from './heat.ts';

test('heat numbers count days from the epoch', () => {
  assert.equal(heatNumber('2026-10-09'), '001');
  assert.equal(heatNumber('2026-11-18'), '041');
  assert.equal(heatNumber('2026-12-09'), '062');
});

test('date labels are UTC and short', () => {
  assert.equal(dateLabel('2026-11-18'), 'Wed 18 Nov');
  assert.equal(dayInitial('2026-11-18'), 'W');
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
});

test('the daily target is deterministic, in range, with two decimals', () => {
  const seen = new Set<number>();
  for (let i = 0; i < 400; i++) {
    const day = shiftDay('2026-10-09', i);
    const t = targetFor(day);
    assert.equal(t, targetFor(day));
    assert.ok(t >= TARGET_MIN && t <= TARGET_MAX, `${day}: ${t}`);
    assert.equal(Math.round(t * 100) / 100, t, `${day}: ${t} has more than two decimals`);
    seen.add(t);
  }
  assert.ok(seen.size > 300, 'targets vary from day to day');
});

test('time validation rejects mis-taps and abandoned runs', () => {
  assert.equal(isValidTime(7.12), true);
  assert.equal(isValidTime(0.1), false);
  assert.equal(isValidTime(90), false);
  assert.equal(isValidTime('7'), false);
  assert.equal(isValidTime(Number.NaN), false);
});

test('gap words', () => {
  assert.equal(gapWord(-0.18), 'early');
  assert.equal(gapWord(0.42), 'late');
  assert.equal(gapWord(0.001), 'dead on');
});

test('closer-than share', () => {
  assert.equal(closerThan(1, 1), 100);
  assert.equal(closerThan(1, 101), 100);
  assert.equal(closerThan(101, 101), 0);
  assert.equal(closerThan(836, 3214), 74);
});

test('histogram bins clamp at both ends', () => {
  assert.equal(binIndex(-9), 0);
  assert.equal(binIndex(-0.18), 13);
  assert.equal(binIndex(0), 15);
  assert.equal(binIndex(9), 29);
});

test('countdown to the next heat', () => {
  const now = Date.parse('2026-11-18T16:17:50Z');
  assert.equal(clockLabel(msToNextHeat(now)), '07:42:10');
});

test('streak window is 14 days ending today', () => {
  const days = windowDays('2026-11-18');
  assert.equal(days.length, 14);
  assert.equal(days[13], '2026-11-18');
  assert.equal(days[0], '2026-11-05');
});
