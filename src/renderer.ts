import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

import {
  NFAMatcher,
  EPSILON,
} from './nfa';

const createGraphFromNFAMatcher = (matcher: NFAMatcher): any => {
  const states = matcher.getStates();
  const currentStates = matcher.getCurrentStates();
  const initialState = matcher.getInitialState();
  const finalState = matcher.getFinalState();
  const alphabets = matcher.getAlphabets();

  var g = new dagreD3.graphlib.Graph({multigraph: true})
    .setGraph({
      nodesep: 6,
      ranksep: 8,
      rankdir: "LR",
      marginx: 10,
      marginy: 10,
    })
    .setDefaultEdgeLabel(function () {return {};});

  states.forEach(state => {
    let classList: string[] = [];
    let label = state;
    let style = '';

    if (currentStates.has(state)) {
      style += 'fill: coral';
    }
    if (state === initialState) {
      label += '\n(init)'
    }
    if (state === finalState) {
      label += '\n(fin)'
    }
    g.setNode(state, {label: label, 'class': classList.join(' '), style, shape: 'circle'});
  });

  states.forEach(state => {
    alphabets.forEach(alphabet => {
      matcher.getNextStates(state, alphabet).forEach(nextState => {
        g.setEdge(state, nextState, {label: alphabet}, alphabet);
      });
    });
    matcher.getNextStates(state, EPSILON).forEach(nextState => {
      g.setEdge(state, nextState, {label: 'ε'}, EPSILON);
    });
  });
  return g;
}

const renderGraph = (g: any) => {
  var render = new dagreD3.render();
  var svg = d3.select("svg");
  render(d3.select("svg g"), g);

  // resize for visibility
  svg.attr("height", g.graph().height + 20);
  svg.attr("width", g.graph().width + 20);
}

export {
  createGraphFromNFAMatcher,
  renderGraph
};
