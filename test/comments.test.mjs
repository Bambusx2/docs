import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pageKey,
  clampName,
  clampBody,
  removeById,
} from '../netlify/functions/comments.mjs';

test('pageKey normalizes pathnames into safe, stable keys', () => {
  assert.equal(pageKey('/guides/managing-users/'), 'guides__managing-users');
  assert.equal(pageKey('/'), 'index');
  assert.equal(pageKey(''), 'index');
  // Path traversal / odd characters collapse to underscores, never escape.
  assert.equal(pageKey('/../../etc/passwd'), '______etc__passwd');
  assert.equal(pageKey('/A/B'), 'a__b');
});

test('clampName trims and caps at 80 chars', () => {
  assert.equal(clampName('  Ada  '), 'Ada');
  assert.equal(clampName(123), '');
  assert.equal(clampName('x'.repeat(200)).length, 80);
});

test('clampBody trims and caps at 4000 chars', () => {
  assert.equal(clampBody('  hi  '), 'hi');
  assert.equal(clampBody(null), '');
  assert.equal(clampBody('y'.repeat(5000)).length, 4000);
});

test('removeById drops the matching comment and reports removal', () => {
  const comments = [
    { id: 'a', body: 'one' },
    { id: 'b', body: 'two' },
    { id: 'c', body: 'three' },
  ];
  const hit = removeById(comments, 'b');
  assert.equal(hit.removed, true);
  assert.deepEqual(hit.comments.map((c) => c.id), ['a', 'c']);

  const miss = removeById(comments, 'zzz');
  assert.equal(miss.removed, false);
  assert.equal(miss.comments.length, 3);

  // Tolerates non-array input.
  const empty = removeById(undefined, 'a');
  assert.equal(empty.removed, false);
  assert.deepEqual(empty.comments, []);
});
