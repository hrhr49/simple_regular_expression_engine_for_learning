import {
  Parser,
} from '../src/parser';

test('parser positive test', () => {
  expect(new Parser('').parse()).toEqual({type: 'EMPTY'});

  expect(new Parser('a').parse()).toEqual({
    type: 'CHARACTOR',
    char: 'a',
  });

  expect(new Parser('(a)').parse()).toEqual({
    type: 'CHARACTOR',
    char: 'a',
  });

  expect(new Parser('()').parse()).toEqual({type: 'EMPTY'});
  expect(new Parser('(())').parse()).toEqual({type: 'EMPTY'});

  expect(new Parser('ab').parse()).toEqual({
    type: 'CONCATENATION',
    left: {
      type: 'CHARACTOR',
      char: 'a',
    },
    right: {
      type: 'CHARACTOR',
      char: 'b',
    },
  });

  expect(new Parser('a|b').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'CHARACTOR',
      char: 'a',
    },
    right: {
      type: 'CHARACTOR',
      char: 'b',
    },
  });

  expect(new Parser('a*').parse()).toEqual({
    type: 'KLEENE_STAR',
    child: {
      type: 'CHARACTOR',
      char: 'a',
    },
  });

  expect(new Parser('()*').parse()).toEqual({
    type: 'KLEENE_STAR',
    child: {
      type: 'EMPTY',
    },
  });

  expect(new Parser('a|').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'CHARACTOR',
      char: 'a',
    },
    right: {
      type: 'EMPTY',
    },
  });

  expect(new Parser('|a').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'EMPTY',
    },
    right: {
      type: 'CHARACTOR',
      char: 'a',
    },
  });

  expect(new Parser('|').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'EMPTY',
    },
    right: {
      type: 'EMPTY',
    },
  });

  expect(new Parser('(|)').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'EMPTY',
    },
    right: {
      type: 'EMPTY',
    },
  });

  expect(new Parser('ab|c').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'CONCATENATION',
      left: {
        type: 'CHARACTOR',
        char: 'a',
      },
      right: {
        type: 'CHARACTOR',
        char: 'b',
      },
    },
    right: {
      type: 'CHARACTOR',
      char: 'c',
    }
  });

  expect(new Parser('a*|b').parse()).toEqual({
    type: 'ALTERNATION',
    left: {
      type: 'KLEENE_STAR',
      child: {
        type: 'CHARACTOR',
        char: 'a',
      },
    },
    right: {
      type: 'CHARACTOR',
      char: 'b',
    }
  });

  expect(new Parser('ab*').parse()).toEqual({
    type: 'CONCATENATION',
    left: {
      type: 'CHARACTOR',
      char: 'a',
    },
    right: {
      type: 'KLEENE_STAR',
      child: {
        type: 'CHARACTOR',
        char: 'b',
      },
    }
  });

  expect(new Parser('(a|b)*c').parse()).toEqual({
    type: 'CONCATENATION',
    left: {
      type: 'KLEENE_STAR',
      child: {
        type: 'ALTERNATION',
        left: {
          type: 'CHARACTOR',
          char: 'a',
        },
        right: {
          type: 'CHARACTOR',
          char: 'b',
        }
      }
    },
    right: {
      type: 'CHARACTOR',
      char: 'c',
    },
  });

});


test('parser negative test', () => {
  expect(() => new Parser('(').parse()).toThrow();
  expect(() => new Parser(')').parse()).toThrow();
  expect(() => new Parser('*').parse()).toThrow();
  expect(() => new Parser('|*').parse()).toThrow();
  expect(() => new Parser('(*)').parse()).toThrow();
  expect(() => new Parser('a**').parse()).toThrow();
});
