import {
  createGraphFromNFAMatcher,
  renderGraph
} from './renderer';
import {
  compileRegex,
} from './regex';
import {
  NFAMatcher,
} from './nfa';
import './style.scss';

const regexTextElem = document.getElementById('regex-text');
const inputTextElem = document.getElementById('input-text');
const inputTextMsgElem = document.getElementById('input-text-msg');

let matcher: NFAMatcher = null;
let pos = 0;

regexTextElem.addEventListener('keyup', () => {
  document.getElementById('msg').textContent = '';
  const regexText = (regexTextElem as any).value;
  try {
    for (let i = 0; i < regexText.length; i++) {
      const char = regexText.charAt(i);
      if (!/[a-zA-Z\|\*\(\)]/.test(char)) {
        throw `${char} is invalid character`;
      }
    }
    matcher = compileRegex(regexText);
    const g = createGraphFromNFAMatcher(matcher);
    renderGraph(g);
  } catch(e){
    const svg = document.querySelector('svg g');
    svg.childNodes.forEach(child => {
      svg.removeChild(child);
    });
    document.getElementById('msg').textContent = e;
  }finally {
  }
});

inputTextElem.addEventListener('keyup', () => {
  inputTextMsgElem.textContent = '';
  pos = 0;
  const inputText = (inputTextElem as any).value;
  try {
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText.charAt(i);
      if (!/[a-zA-Z]/.test(char)) {
        throw `${char} is invalid character`;
      }
    }
  } catch(e){
    inputTextMsgElem.textContent = e;
  }finally {
  }
});

// const inputTextMsgElem = document.getElementById('input-text-msg');
