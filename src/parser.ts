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
  private consume = (char: string) => {
    if (this.curChar() === char) {
      this.pos++;
    } else {
      let posStr = '';
      for (let i = 0; i < this.src.length; i++) {
        posStr += i === this.pos ? '^' : ' ';
      }
      throw `\
${char} is expected at ${this.pos}
${this.src}
${posStr}
`
    }
  }

  public parse = (): ASTNode => {
    const r = this.parseAlternation();
    if (!this.isEnd()) {
        throw `Cannot accept character ${this.curChar()} at ${this.pos}`;
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
      const right = this.parseConcatenation();
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
    } else if (!['*', '|', '(', ')'].includes(this.curChar())) {
      const char =  this.curChar();
      this.consume(char);
      return {
        type: 'CHARACTOR',
        char,
      };
    } else {
      throw `character '${this.curChar()}' is invalid`;
    }
  }
}

export {
  Parser,
  ASTNode,
};
