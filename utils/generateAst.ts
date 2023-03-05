const types = [
  "Binary   = left: Expr, operator: Token, right: Expr",
  "Grouping = expression: Expr",
  "Literal  = value: any",
  "Unary    = operator: Token, right: Expr",
];

function main() {
  const baseClass = "Expr";
  const source = defineAst(baseClass, types);

  const encoder = new TextEncoder();
  const data = encoder.encode(source);

  Deno.writeFileSync(`Expr.ts`, data);
}

main();

function defineAst(baseClass: string, types: Array<string>) {
  let str = "";

  str += line(`import { Token } from "./Token.ts";\n`);

  str += defineVisitor(baseClass, types);

  str += line(`class ${baseClass} {`);

  str += line(`  accept<R>(_visitor: Visitor<R>): any {}`);

  str += line("}\n");

  for (const type of types) {
    const [className, fields] = type.split("=").map((s) => s.trim());

    str += defineType(baseClass, className, fields);
  }

  return str;
}

function defineVisitor(baseClass: string, types: string[]) {
  let str = "";

  str += line("export interface Visitor<T> {");

  for (const type of types) {
    const className = type.split("=")[0].trim();

    str += line(
      `  visit${className}${baseClass}: (${baseClass.toLowerCase()}: ${className}) => T`
    );
  }

  str += line(`}\n`);

  return str;
}

function defineType(baseClass: string, className: string, fields: string) {
  const fieldArguments = fields
    .split(",")
    .map((f) => f.split(":")[0])
    .map((s: string) => s.trim());

  let str = "";
  str += line(`export class ${className} extends ${baseClass} {`);

  str += line(`  ${fields.replaceAll(",", ";")};\n`);

  str += line(`  constructor(${fields}) {`);

  str += line(`    super();`);

  for (const field of fieldArguments) {
    str += line(`    this.${field} = ${field};`);
  }

  str += line("  }\n");

  str += line("  accept<R>(visitor: Visitor<R>) {");
  str += line(`    return visitor.visit${className}${baseClass}(this); `);
  str += line("  }");

  str += line("}\n");

  return str;
}

function line(str: string) {
  return `${str}\n`;
}
