import { Parser } from "./Parser.ts";
import { Scanner } from "./Scanner.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";
import { AstPrinter } from "./AstPrinter.ts";
import { RuntimeError } from "./Error.ts";
import { Interpreter } from "./Interpreter.ts";

let hadError = false;
let hasRuntimeError = false;
let interpreter = new Interpreter();

export class Lox {
  main() {
    const args = Deno.args;

    if (args.length > 1) {
      console.log("Usage: jlox [script]");
      return Deno.exit(64);
    }

    if (args.length === 1) {
      return this.runFile(args[0]);
    }

    this.runPrompt();
  }

  runPrompt() {
    while (true) {
      const input = prompt("Lox >");

      if (input === null) {
        break;
      }

      hadError = false;
      this.run(input);
    }
  }

  async runFile(filePath: string) {
    const decoder = new TextDecoder("utf-8");
    const rawBinary = await Deno.readFile(filePath);

    this.run(decoder.decode(rawBinary));
    if (hadError) {
      Deno.exit(65);
    }
    if (hasRuntimeError) {
      Deno.exit(70);
    }
  }

  run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanLines();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (!expression) return console.log("No expression");
    interpreter.interpret(expression);

    // const prettyPrintedAst = new AstPrinter().toString(expression);
    // console.log(prettyPrintedAst);
  }

  error(line: number, message: string) {
    Lox.report(line, "", message);
    hadError = true;
  }

  static errorStatic(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      this.report(token.line, "at end", message);
    } else {
      this.report(token.line, " at " + token.lexeme + " ", message);
    }
    hadError = true;
  }

  static runtimeError(e: RuntimeError) {
    console.error(e.message + "\n[line " + e.token.line + "]");
    hasRuntimeError = true;
  }

  static report(line: number, where: string, message: string) {
    console.error("[line " + line + "] Error" + where + ": " + message);
  }
}
