import { Token } from "./Token.ts";

export interface Visitor<T> {
  visitBinaryExpr: (expr: Binary) => T;
  visitGroupingExpr: (expr: Grouping) => T;
  visitLiteralExpr: (expr: Literal) => T;
  visitUnaryExpr: (expr: Unary) => T;
}

export class Expr {
  // deno-lint-ignore no-explicit-any
  accept<R = any>(_visitor: Visitor<R>): any {}
}

export class Binary extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping extends Expr {
  expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  // deno-lint-ignore no-explicit-any
  value: any;

  // deno-lint-ignore no-explicit-any
  constructor(value: any) {
    super();
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}
