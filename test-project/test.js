import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSum, clamp } from './index.js';

test('calculateSum adds numbers correctly', () => {
  assert.equal(calculateSum(5, 7), 12);
});

test('clamp restricts values within specified range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});
