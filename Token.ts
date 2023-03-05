import { TokenType } from "./TokenType.ts";

export class Token {
  type: TokenType;
  lexeme: string;
  // @deno-ignore
  literal: any;
  line: number;

  constructor(type: TokenType, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }
}
