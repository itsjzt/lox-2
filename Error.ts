import { Token } from "./Token.ts";

export class ParseError extends SyntaxError {}

export class RuntimeError extends EvalError {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}
