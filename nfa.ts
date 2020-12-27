import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

import './style.scss';

// https://en.wikipedia.org/wiki/Thompson%27s_construction
const EPSILON = 'EPSILON'
type State = string
type Alphabet = string
type Transition = Map<State, Map<Alphabet, State[]>>

interface NFA {
  states: Set<State>
  alphabets: Set<string>
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

  match = (target: Alphabet[]): boolean => {
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

  private getNextStates = (currentState: State, alphabet: Alphabet): State[] => {
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

  private transition = (alphabet: string) => {
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

  public createGraph = (): any => {
    // label(ノード内の文字)をもつグラフを作成(多重辺もOKとする)
    var g = new dagreD3.graphlib.Graph({multigraph: true})
    .setGraph({})
    .setDefaultEdgeLabel(function() { return {}; });

    // ノードを追加していく。
    this.nfa.states.forEach(state => {
      if (this.currentStates.has(state)) {
        g.setNode(state,  {label: state, 'class': 'current-state'});
      } else {
        g.setNode(state,  {label: state});
      }
    });

    // ノードはもともと長方形だがコーナーを丸くしている
    g.nodes().forEach(function(v) {
      var node = g.node(v);
      node.rx = node.ry = 5;
    });

    // エッジを追加していく
    this.nfa.states.forEach(state => {
      this.nfa.alphabets.forEach(alphabet => {
        this.getNextStates(state, alphabet).forEach(nextState => {
          console.log(state, nextState, alphabet);
          g.setEdge(state, nextState, {label: alphabet}, alphabet);
        });
      });
      this.getNextStates(state, EPSILON).forEach(nextState => {
        g.setEdge(state, nextState, {label: 'ε'});
      });
    });
    return g;
  }
}


const renderGraph = (g: any) => {
  // renderという関数を用意している。これが最終的に図を生成する関数
  var render = new dagreD3.render();

  // d3.select("svg");により，htmlにあるsvg要素が選択される。svgが複数ある場合は注意。その場合，svgの親要素をselectして，それにsvgをappendすればよい
  var svg = d3.select("svg");

  // svgの子要素gの部分に，グラフgをレンダー
  render(d3.select("svg g"), g);

  // svgのサイズがデフォルトのままでは見切れてしまうので大きさを調整
  svg.attr("height", g.graph().height + 20);
  svg.attr("width", g.graph().width + 20);
}

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

const matcher = new NFAMatcher(nfa);
console.log(matcher.match(['b']));
const g = matcher.createGraph();
console.log(g);
renderGraph(g);
