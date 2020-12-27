import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

import {
  NFAMatcher,
  EPSILON,
} from './nfa';

const createGraphFromNFAMatcher = (matcher: NFAMatcher): any => {
  const states = matcher.getStates();
  const currentStates = matcher.getCurrentStates();
  const alphabets = matcher.getAlphabets();

  // label(ノード内の文字)をもつグラフを作成(多重辺もOKとする)
  var g = new dagreD3.graphlib.Graph({multigraph: true})
    .setGraph({
      nodesep: 10,
      ranksep: 10,
      rankdir: "TB",
      marginx: 10,
      marginy: 10,
    })
    .setDefaultEdgeLabel(function () {return {};});

  // ノードを追加していく。
  states.forEach(state => {
    if (currentStates.has(state)) {
      g.setNode(state, {label: state, 'class': 'current-state'});
    } else {
      g.setNode(state, {label: state});
    }
  });

  // ノードはもともと長方形だがコーナーを丸くしている
  g.nodes().forEach(function (v) {
    var node = g.node(v);
    node.rx = node.ry = 5;
  });

  // エッジを追加していく
  states.forEach(state => {
    alphabets.forEach(alphabet => {
      matcher.getNextStates(state, alphabet).forEach(nextState => {
        console.log(state, nextState, alphabet);
        g.setEdge(state, nextState, {label: alphabet}, alphabet);
      });
    });
    matcher.getNextStates(state, EPSILON).forEach(nextState => {
      g.setEdge(state, nextState, {label: 'ε'});
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
