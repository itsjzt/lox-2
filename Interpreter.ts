import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./Expr.ts";
import { TokenType } from "./TokenType.ts";
import { Lox } from "./Lox.ts";
import { Token } from "./Token.ts";
import { RuntimeError } from "./Error.ts";

export class Interpreter implements Visitor<any> {
  visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  // deno-lint-ignore no-explicit-any
  visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  // deno-lint-ignore no-explicit-any
  evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  visitUnaryExpr(expr: Unary) {
    const right = expr.right;

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -right;
      case TokenType.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }

  // deno-lint-ignore no-explicit-any
  isTruthy(expr: any) {
    if (expr === null) return false;
    if (expr === false) return false;

    return true;
  }

  interpret(expression: Expr) {
    try {
      const value: any = this.evaluate(expression);
      console.log(value);
    } catch (e) {
      Lox.runtimeError(e);
    }
  }

  visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.PLUS:
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return this.isEqual(left, right);
    }
  }

  // deno-lint-ignore no-explicit-any
  checkNumberOperands(operator: Token, right: any, left: any) {
    if (typeof left === "number" && typeof right === "number") {
      return;
    }

    throw new RuntimeError(operator, "Operands must of type numb");
  }

  // deno-lint-ignore no-explicit-any
  isEqual(a: any, b: any) {
    if (a == null && b == null) return true;
    if (a == null) return false;

    return a == b;
  }
}
