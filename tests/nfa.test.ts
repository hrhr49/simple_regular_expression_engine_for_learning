import {
  NFA,
  NFAMatcher,
  EPSILON,
} from '../nfa';

const nfa: NFA = {
  states: new Set(['s1', 's2', 's3']),
  alphabets: new Set(['a', 'b']),
  transition: new Map([
    [
      's1', new Map([
        ['a', ['s2']],
        ['b', ['s2']],
        [EPSILON, ['s3']],
      ])
    ],
    [
      's2', new Map([
        ['b', ['s2']],
      ])
    ],
    [
      's3', new Map([
        ['b', ['s3']],
      ])
    ],
  ]),
  initialState: 's1',
  finalState: 's3',
};

test('ok', () => {
  const matcher = new NFAMatcher(nfa);
  expect(matcher.match('a')).toBe(false);
  expect(matcher.match('b')).toBe(true);
  expect(matcher.match('bb')).toBe(true);
  expect(matcher.match('')).toBe(true);
});
