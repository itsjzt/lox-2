import { Token } from "./Token.ts";
import { Binary, Expr, Grouping, Literal, Unary } from "./Expr.ts";
import { TokenType } from "./TokenType.ts";
import { Lox } from "./Lox.ts";
import { ParseError } from "./Error.ts";

export class Parser {
  tokens: Array<Token>;
  current = 0;

  constructor(tokens: Array<Token>) {
    this.tokens = tokens;
  }

  parse() {
    try {
      return this.expression();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  expression(): Expr {
    return this.equality();
  }

  equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison(): Expr {
    let expr = this.term();
    const t = TokenType;

    while (this.match(t.GREATER, t.GREATER_EQUAL, t.LESS, t.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH)) {
      const operator = this.previous();
      const right = this.unary();

      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expected expression");
  }

  consume(type: TokenType, message: string) {
    if (this.check(type)) this.advance();

    throw this.error(this.peek(), message);
  }

  error(token: Token, message: string) {
    Lox.errorStatic(token, message);
    return new ParseError();
  }

  match(...tokens: TokenType[]) {
    for (const type of tokens) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  check(type: TokenType) {
    if (this.isAtEnd()) return false;

    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;

    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }
}
