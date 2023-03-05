import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

const keywords = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
};

export class Scanner {
  source: string;
  tokens: Array<Token> = [];
  start = 0;
  current = 0;
  line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanLines() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));

    return this.tokens;
  }

  scanToken() {
    const c = this.advance();

    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case " ":
      case "\t":
      case "\r":
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "0":
        this.number();
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      default: {
        if (this.isAlpha(c)) {
          this.identifier();
        } else {
          console.log(this.line, "Unexpected character", c);
          Deno.exit(65);
        }
      }
    }
  }

  isAlpha(c: string) {
    if (c >= "a" && c <= "z") {
      return true;
    }

    if (c >= "A" && c <= "Z") {
      return true;
    }

    if (c === "_") {
      return true;
    }

    return false;
  }

  isAlphaNumeric(c: string) {
    if (this.isAlpha(c) || this.isDigit(c)) {
      return true;
    }

    return false;
  }

  identifier() {
    let str = "";
    while (this.isAlphaNumeric(this.peek())) str += this.advance();

    if (keywords[str as keyof typeof keywords]) {
      this.addToken(keywords[str as keyof typeof keywords]);
    } else {
      this.addToken(TokenType.IDENTIFIER);
    }
  }

  isDigit(n: string) {
    switch (n) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "0":
        return true;
      default:
        return false;
    }
  }

  number() {
    let str = "";
    while (this.isDigit(this.peek())) {
      str += this.advance();
    }

    // handle fractions
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // consume the .
      str += this.advance() + this.number();
    }

    this.addToken(TokenType.NUMBER, parseFloat(str));
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return "\0";

    return this.source.charAt(this.current + 1);
  }

  string() {
    let str = "";
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      str += this.advance();
    }

    if (this.isAtEnd()) {
      console.log(this.line, "Unterminated string.");
      return;
    }

    // the ending "
    this.advance();
    this.addToken(TokenType.STRING, str);
  }

  peek() {
    if (this.isAtEnd()) return "\0";

    return this.source.charAt(this.current);
  }

  match(expected: string) {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  advance() {
    return this.source.charAt(this.current++);
  }

  addToken(type: TokenType, literal?: any) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal || null, this.line));
  }

  isAtEnd() {
    return this.current > this.source.length;
  }
}
