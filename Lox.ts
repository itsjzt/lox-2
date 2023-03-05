import { Scanner } from "./Scanner.ts";

export class Lox {
  hadError = false;

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
      const input = prompt(">");

      console.log({ input });

      if (input === null) {
        break;
      }

      this.hadError = false;
      this.run(input);
    }
  }

  async runFile(filePath: string) {
    const decoder = new TextDecoder("utf-8");
    const rawBinary = await Deno.readFile(filePath);

    this.run(decoder.decode(rawBinary));
    if (this.hadError) {
      Deno.exit(65);
    }
  }

  run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanLines();

    for (const token of tokens) {
      console.log(token);
    }
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  report(line: number, where: string, message: string) {
    console.error("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
}
