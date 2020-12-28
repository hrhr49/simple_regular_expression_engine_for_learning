// ''
interface EmptyNode {
  type: 'EMPTY'
}

// 'a|b'
interface AlternationNode {
  type: 'ALTERNATION'
  left: ASTNode
  right: ASTNode
}

// 'a'
interface CharacterNode {
  type: 'CHARACTOR'
  char: string
}

// 'ab'
interface ConcatenationNode {
  type: 'CONCATENATION'
  left: ASTNode
  right: ASTNode
}

// 'a*'
interface KleeneStarNode {
  type: 'KLEENE_STAR'
  child: ASTNode
}

type ASTNode = (
    EmptyNode
  | AlternationNode
  | CharacterNode
  | ConcatenationNode
  | KleeneStarNode
);

class Parser {
  src: string
  pos: number

  constructor(src: string) {
    this.src = src;
    this.pos = 0;
  }

  private curChar = (): string => this.src.charAt(this.pos);
  private isEnd = (): boolean => this.pos >= this.src.length;

  private createErrorMessage = (msg: string) => {
    let posStr = Array(this.src.length).fill(null)
      .map((_, i) => i === this.pos ? '^' : ' ').join('');
    return `${msg}\n${this.src}\n${posStr}\n`;
  }

  private consume = (char: string) => {
    if (this.curChar() === char) {
      this.pos++;
    } else {
      throw this.createErrorMessage(`'${char}' is expected`);
    }
  }

  public parse = (): ASTNode => {
    const r = this.parseAlternation();
    if (!this.isEnd()) {
        throw this.createErrorMessage(`Cannot accept character ${this.curChar()}`);
    }
    return r;
  }

  private parseAlternation = (): ASTNode => {
    let left = this.parseConcatenation();
    while (!this.isEnd() && this.curChar() === '|') {
      this.consume('|');
      const right = this.parseConcatenation();
      left = {
        type: 'ALTERNATION',
        left, right,
      }
    }
    return left;
  }

  private parseConcatenation = (): ASTNode => {
    let left = this.parseKleeneStar();
    while (!this.isEnd() && !['|', '*', ')'].includes(this.curChar())) {
      const right = this.parseKleeneStar();
      left = {
        type: 'CONCATENATION',
        left, right,
      }
    }
    return left;
  }

  private parseKleeneStar = (): ASTNode => {
    let child = this.parsePrimary();
    if (!this.isEnd() && this.curChar() === '*') {
      this.consume('*')
      child = {
        type: 'KLEENE_STAR',
        child,
      }
      // cannot repeat '*' itself.
      if (!this.isEnd() && this.curChar() === '*') {
        throw this.createErrorMessage(`'*' is invalid. Nothing to repeat`);
      }
    }
    return child;
  }

  private parsePrimary = (): ASTNode => {
    if (this.isEnd() || ['|', ')'].includes(this.curChar())) {
      return {type: 'EMPTY'};
    } else if (this.curChar() === '(') {
      this.consume('(')
      const r = this.parseAlternation();
      this.consume(')')
      return r;
    } else if (this.curChar() === '*') {
      throw this.createErrorMessage(`'*' is invalid. Nothing to repeat`);
    } else if (!['*', '|', '(', ')'].includes(this.curChar())) {
      const char =  this.curChar();
      this.consume(char);
      return {
        type: 'CHARACTOR',
        char,
      };
    } else {
      throw this.createErrorMessage(`character '${this.curChar()}' is invalid`);
    }
  }
}

export {
  Parser,
  ASTNode,
};
