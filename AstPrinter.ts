import { Expr, Binary, Grouping, Literal, Unary, Visitor } from "./Expr.ts";

export class AstPrinter implements Visitor<string> {
  toString(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal) {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize(name: string, ...exprs: Expr[]) {
    let str = "";

    str += "(";
    str += name;

    for (const expr of exprs) {
      str += " ";
      str += expr.accept(this);
    }

    str += ")";

    return str;
  }
}
