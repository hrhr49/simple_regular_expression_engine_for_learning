// Create NFA by 'Tompson Construction' algorithm.
// https://en.wikipedia.org/wiki/Thompson%27s_construction
import {
  NFA,
  NFAMatcher,
  EPSILON,
  State,
  Alphabet,
} from './nfa';
import {
  Parser,
  ASTNode,
} from './parser';

let tmpId = 0;
const uuid = (): State => `s${tmpId++}`;

const constructNFA = (node: ASTNode, alphabets: Set<Alphabet>): NFA => {
  switch (node.type) {
    case 'EMPTY': case 'CHARACTOR': {
      const alphabet = node.type === 'EMPTY' ? EPSILON : node.char;
      const initialState = uuid();
      const finalState = uuid();
      return {
        states: new Set<State>([initialState, finalState]),
        alphabets,
        transition: new Map([
          [
            initialState, new Map([
              [alphabet, [finalState]]
            ])
          ]
        ]),
        initialState,
        finalState,
      };
    }
    case 'ALTERNATION': {
      const initialState = uuid();
      const left = constructNFA(node.left, alphabets);
      const right = constructNFA(node.right, alphabets);
      const finalState = uuid();
      const transition = new Map([
        ...Array.from(left.transition.entries()),
        ...Array.from(right.transition.entries()),
        [
          initialState, new Map([
            [EPSILON, [left.initialState, right.initialState]]
          ])
        ],
        [
          left.finalState, new Map([
            [EPSILON, [finalState]]
          ])
        ],
        [
          right.finalState, new Map([
            [EPSILON, [finalState]]
          ])
        ],
      ]);
      const states = new Set([
        ...Array.from(left.states),
        ...Array.from(right.states),
        initialState,
        finalState,
      ]);
      return {
        states,
        alphabets,
        transition,
        initialState,
        finalState,
      };
    }
    case 'CONCATENATION': {
      // NOTE:
      // instead of merging left.finalState and right.initialState,
      // connect left.finalState and right.initialState by
      // EPSILON arrow for implementaion convenience,
      const left = constructNFA(node.left, alphabets);
      const right = constructNFA(node.right, alphabets);
      const initialState = left.initialState;
      const finalState = right.finalState;

      const transition = new Map([
        ...Array.from(left.transition.entries()),
        ...Array.from(right.transition.entries()),
        [
          left.finalState, new Map([
            [EPSILON, [right.initialState]]
          ])
        ],
      ]);
      const states = new Set([
        ...Array.from(left.states),
        ...Array.from(right.states),
      ]);
      return {
        states,
        alphabets,
        transition,
        initialState,
        finalState,
      };
    }
    case 'KLEENE_STAR': {
      const initialState = uuid();
      const child = constructNFA(node.child, alphabets);
      const finalState = uuid();

      const transition = new Map([
        ...Array.from(child.transition.entries()),
        [
          initialState, new Map([
            [EPSILON, [child.initialState]]
          ])
        ],
        [
          child.finalState, new Map([
            [EPSILON, [child.initialState, finalState]]
          ])
        ],
      ]);
      const states = new Set([
        ...Array.from(child.states),
        initialState,
        finalState,
      ]);
      return {
        states,
        alphabets,
        transition,
        initialState,
        finalState,
      };
    }
  }
};

const ALPHABETS = new Set<Alphabet>(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
);
const compileRegex = (src: string): NFAMatcher => {
  // reset tmpId
  tmpId = 0;
  const node = new Parser(src).parse();
  const nfa = constructNFA(node, ALPHABETS);
  return new NFAMatcher(nfa);
}

export {
  compileRegex,
};
