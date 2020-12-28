// TODO: refactoring. state management is ugly.
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
import '../style.scss';

const regexTextElem = document.getElementById('regex-text') as HTMLInputElement;
const msgElem = document.getElementById('msg') as HTMLDivElement;
const inputTextElem = document.getElementById('input-text') as HTMLInputElement;
const inputTextMsgElem = document.getElementById('input-text-msg') as HTMLDivElement;
const inputTextStateElem = document.getElementById('input-text-state') as HTMLDivElement;
const resetButtonElem = document.getElementById('reset') as HTMLButtonElement;
const stepButtonElem = document.getElementById('step') as HTMLButtonElement;

const defaultRegexText = '(a|bc)*'
const defaultInputText = 'abcaa'


let matcher: NFAMatcher = null;
let pos = 0;
let inputText = '';

const clearGraph = () => {
  const svg = document.querySelector('svg g');
  svg.childNodes.forEach(child => {
    svg.removeChild(child);
  });
};

const clearInputState = () => {
  console.log('clearInputState')
  pos = 0;
  inputTextStateElem.innerHTML = '';
};

const init = () => {
  regexTextElem.value = defaultRegexText;
  inputTextElem.value = defaultInputText;
  inputText = defaultInputText;
  clearInputState();
  matcher = compileRegex(defaultRegexText);
  updateGraph(matcher);
  setTextState();
};

const updateGraph = (matcher: NFAMatcher) => {
  const g = createGraphFromNFAMatcher(matcher);
  renderGraph(g);
};

regexTextElem.addEventListener('keyup', () => {
  msgElem.textContent = '';
  const regexText = regexTextElem.value;
  matcher = null;
  try {
    for (let i = 0; i < regexText.length; i++) {
      const char = regexText.charAt(i);
      if (!/[a-zA-Z\|\*\(\)]/.test(char)) {
        throw `${char} is invalid character`;
      }
    }
    clearInputState();
    matcher = compileRegex(regexText);
    updateGraph(matcher);
    setTextState();
  } catch(e){
    clearGraph();
    document.getElementById('msg').textContent = e;
  }finally {
  }
});

inputTextElem.addEventListener('keyup', () => {
  inputTextMsgElem.textContent = '';
  clearInputState();
  inputText = inputTextElem.value;
  if (matcher) {
    matcher.initialize();
    updateGraph(matcher);
  }
  resetButtonElem.disabled = true;
  stepButtonElem.disabled = true;
  try {
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText.charAt(i);
      if (!/[a-zA-Z]/.test(char)) {
        throw `${char} is invalid character`;
      }
    }
    resetButtonElem.disabled = false;
    stepButtonElem.disabled = false;
    setTextState();
  } catch(e){
    inputTextMsgElem.textContent = e;
  }finally {
  }
});

resetButtonElem.addEventListener('click', () => {
  clearInputState();
  setTextState();
  if (matcher) {
    matcher.initialize();
    updateGraph(matcher);
  }
});

stepButtonElem.addEventListener('click', () => {
  if (pos < inputText.length) {
    const char = inputText.charAt(pos);
    pos++;
    if (matcher) {
      matcher.transition(char);
      const g = createGraphFromNFAMatcher(matcher);
      renderGraph(g);
    }

    if (pos >= inputText.length) {
      showResult();
    } else {
      setTextState();
    }
  }
});

const showResult = () => {
  if (matcher) {
    inputTextStateElem.textContent = matcher.isAccepted() ? 'Accepted!' : 'Rejected';
  }
};

const setTextState = () => {
  inputTextStateElem.innerHTML = '';
  for (let i = 0; i < inputText.length; i++) {
    if (i === pos) {
      const b = document.createElement('b');
      b.textContent = inputText.charAt(i);
      inputTextStateElem.appendChild(b);
    } else {
      const span = document.createElement('span');
      span.textContent = inputText.charAt(i);
      inputTextStateElem.appendChild(span);
    }
  }
};

init();
