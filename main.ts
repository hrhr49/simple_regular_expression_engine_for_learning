import {
  createGraphFromNFAMatcher,
  renderGraph
} from './renderer';
import {
  compileRegex,
} from './regex';
import './style.scss';

const regexTextElem = document.getElementById('regex-text');
regexTextElem.addEventListener('keyup', () => {
  const regexText = (regexTextElem as any).value;
  try {
    const matcher = compileRegex(regexText);
    const g = createGraphFromNFAMatcher(matcher);
    renderGraph(g);
  } catch {
  }finally {
  }
});
