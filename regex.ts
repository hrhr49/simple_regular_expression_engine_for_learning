// Create NFA(Nondeterministic Finite Automaton) by 'Tompson Construction' algorithm.
// Reference: https://en.wikipedia.org/wiki/Thompson%27s_construction
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
const uuid = (): State => `${tmpId++}`;

const constructNFA = (node: ASTNode, alphabets: Set<Alphabet>): NFA => {
  switch (node.type) {
    case 'EMPTY': case 'CHARACTOR': {
      //   case 'EMPTY'
      //   +------+  epsilon   +-----+
      //   | init | ---------> | fin |
      //   +------+            +-----+
      //
      //   case 'CHARACTOR'
      //   +------+  char   +-----+
      //   | init | ------> | fin |
      //   +------+         +-----+
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
      //   +------+  eps  +------+  eps  +------+
      //   |      |------>| nfa1 |------>|      |
      //   | init |       +------+       | fin  |
      //   |      |  eps  +------+  eps  |      |
      //   |      |------>| nfa2 |------>|      |
      //   +------+       +------+       +------+
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
      //  +-----------+     +---------------------+     +----------+
      //  | nfa1_init | --> | nfa1_fin, nfa2_init | --> | nfa2_fin |
      //  +-----------+     +---------------------+     +----------+
      const left = constructNFA(node.left, alphabets);
      const right = constructNFA(node.right, alphabets);
      const initialState = left.initialState;
      const finalState = right.finalState;

      // remove right.initialState and replace to left.finalState
      right.transition.set(left.finalState, right.transition.get(right.initialState));
      right.transition.delete(right.initialState);
      right.states.delete(right.initialState);

      const transition = new Map([
        ...Array.from(left.transition.entries()),
        ...Array.from(right.transition.entries()),
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
      //            eps
      //     +------------------------------------------------------+
      //     |                                                      v
      //   +------+  eps   +----------+        +---------+  eps   +-----+
      //   | init | -----> | nfa_init | -----> | nfa_fin | -----> | fin |
      //   +------+        +----------+        +---------+        +-----+
      //                     ^          eps      |
      //                     +-------------------+
      const initialState = uuid();
      const child = constructNFA(node.child, alphabets);
      const finalState = uuid();

      const transition = new Map([
        ...Array.from(child.transition.entries()),
        [
          initialState, new Map([
            [EPSILON, [child.initialState, finalState]]
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
