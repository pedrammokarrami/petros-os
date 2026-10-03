import test from 'node:test';
import assert from 'node:assert/strict';
import { add, multiply, formatGreeting } from './mathUtil.js';

test('add calculates sum correctly', () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-1, 1), 0);
});

test('multiply calculates product correctly', () => {
  assert.equal(multiply(3, 4), 12);
});

test('formatGreeting creates expected greeting', () => {
  assert.equal(formatGreeting('Elliot'), 'Hello, Elliot! Autonomous execution verified.');
});
