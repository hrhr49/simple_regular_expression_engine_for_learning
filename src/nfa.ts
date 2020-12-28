// NFA(Nondeterministic Finite Automaton)
//
// NFA Example
//                        b
//                    +---------------------+
//                    |                     v
// +---------+  a   +---+  b   +---+  a   +--------+
// | 0(init) | ---> | 1 | ---> | 2 | ---> | 3(fin) |
// +---------+      +---+      +---+      +--------+
//                    ^   eps    |
//                    +----------+
//
// states = new Set(['0', '1', '2', '3'])
// alphabets = new Set(['a', 'b'])
// transition = new Map([
//   [
//     '0', new Map([
//       ['a', ['1']],
//     ]),
//   ],
//   [
//     '1', new Map([
//       ['b', ['2', '3']],
//     ]),
//   ],
//   [
//     '2', new Map([
//       ['a', ['3']],
//       [EPSILON, ['1']],
//     ]),
//   ],
// ])
// initialState = '0'
// finalState = '3'

const EPSILON = 'EPSILON'
type State = string
type Alphabet = string
type Transition = Map<State, Map<Alphabet, State[]>>

interface NFA {
  states: Set<State>
  alphabets: Set<Alphabet>
  transition: Transition
  initialState: State
  finalState: State
}

class NFAMatcher {
  private currentStates: Set<State>
  private nfa: NFA

  constructor(
    nfa: NFA
  ) {
    this.nfa = nfa;
    this.initialize();
  }

  public match = (target: string): boolean => {
    const alphabets: Alphabet[] = target.split('');
    return this._match(alphabets);
  }

  private _match = (target: Alphabet[]): boolean => {
    this.initialize();
    target.forEach(alphabet => {
      this.transition(alphabet);
    });
    return this.currentStates.has(this.nfa.finalState);
  }

  private initialize = () => {
    this.currentStates = new Set<State>([this.nfa.initialState]);
    this.expandEpsilon();
  }

  public getNextStates = (currentState: State, alphabet: Alphabet): State[] => {
    const stateEntry = this.nfa.transition.get(currentState);
    if (!stateEntry) {
      return [];
    }
    return stateEntry.get(alphabet) || [];
  }

  private expandEpsilon = () => {
    const stateStack = Array.from(this.currentStates);
    const nextStates = new Set<State>(this.currentStates);

    while(stateStack.length > 0) {
      const state = stateStack.pop();

      this.getNextStates(state, EPSILON)
        .forEach(nextState => {
          if(!nextStates.has(nextState)) {
            nextStates.add(nextState);
            stateStack.push(nextState);
          }
        });
    }
    this.currentStates = nextStates
  }

  private transition = (alphabet: Alphabet) => {
    const nextStates = new Set<State>();

    this.currentStates.forEach(state => {
      this.getNextStates(state, alphabet)
        .forEach(nextState => {
          nextStates.add(nextState);
        });
    });
    this.currentStates = nextStates
    this.expandEpsilon();
  }

  public getStates = () => this.nfa.states;
  public getCurrentStates = () => this.currentStates;
  public getInitialState = () => this.nfa.initialState;
  public getFinalState = () => this.nfa.finalState;
  public getAlphabets = () => this.nfa.alphabets;
}

export {
  NFA,
  NFAMatcher,
  EPSILON,
  State,
  Alphabet,
  Transition,
};
