import {
  compileRegex
} from '../regex';

test('regex test', () => {
  expect(compileRegex('').match('')).toBe(true);
  expect(compileRegex('').match('a')).toBe(false);

  expect(compileRegex('a').match('a')).toBe(true);
  expect(compileRegex('a').match('b')).toBe(false);
  expect(compileRegex('a').match('')).toBe(false);

  expect(compileRegex('a*').match('')).toBe(true);
  expect(compileRegex('a*').match('a')).toBe(true);
  expect(compileRegex('a*').match('b')).toBe(false);

  expect(compileRegex('ab').match('')).toBe(false);
  expect(compileRegex('ab').match('a')).toBe(false);
  expect(compileRegex('ab').match('b')).toBe(false);
  expect(compileRegex('ab').match('ab')).toBe(true);

  expect(compileRegex('a|b').match('')).toBe(false);
  expect(compileRegex('a|b').match('a')).toBe(true);
  expect(compileRegex('a|b').match('b')).toBe(true);
  expect(compileRegex('a|b').match('ab')).toBe(false);

  expect(compileRegex('aa*').match('')).toBe(false);
  expect(compileRegex('aa*').match('a')).toBe(true);
  expect(compileRegex('aa*').match('b')).toBe(false);

  expect(compileRegex('a(a|b)*b').match('')).toBe(false);
  expect(compileRegex('a(a|b)*b').match('a')).toBe(false);
  expect(compileRegex('a(a|b)*b').match('b')).toBe(false);
  expect(compileRegex('a(a|b)*b').match('ab')).toBe(true);
  expect(compileRegex('a(a|b)*b').match('aab')).toBe(true);
  expect(compileRegex('a(a|b)*b').match('aabb')).toBe(true);
})
