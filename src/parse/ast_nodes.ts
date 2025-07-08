import { DataType } from "@lhs/data-type";

export type NodeType =
  | "Program"
  | "VarDeclaration"
  | "VarAssignment"
  | "NumericLiteral"
  | "Identifier"
  | "BinExpr"
  | "NullExpr"
  | "StringLiteral";

export enum Operand {
  Plus = "+",
  Minus = "-",
  Multiplication = "*",
  Division = "/",
  Modulo = "%",
}

export abstract class Statement {}

export class Program extends Statement {
  body: Statement[];

  constructor(body: Statement[]) {
    super();
    this.body = body;
  }
}

export class VariableDeclaration extends Statement {
  isConstant: boolean;
  identifier: string;
  value?: Expression;
  dataType?: DataType;

  constructor(
    isConstant: boolean,
    identifier: string,
    value?: Expression,
    dataType?: DataType,
  ) {
    super();
    this.isConstant = isConstant;
    this.identifier = identifier;
    this.value = value;
    this.dataType = dataType;
  }
}

export class Expression extends Statement {}

export class BinaryExpression extends Expression {
  left: Expression;
  right: Expression;
  operand: Operand;

  constructor(left: Expression, right: Expression, operand: Operand) {
    super();
    this.left = left;
    this.right = right;
    this.operand = operand;
  }
}

export class Identifier extends Expression {
  identifier: string;

  constructor(identifier: string) {
    super();

    this.identifier = identifier;
  }
}

export class NumericLiteral extends Expression {
  value: number;

  constructor(value: number) {
    super();

    this.value = value;
  }
}

export class VariableAssignment extends Statement {
  identifier: string;
  value: Expression;

  constructor(identifier: string, value: Expression) {
    super();

    this.identifier = identifier;
    this.value = value;
  }
}

export class StringLiteral extends Expression {
  value: string;

  constructor(value: string) {
    super();

    this.value = value;
  }
}

export class NullExpression extends Expression {}

// export interface State {
//   kind: NodeType;
// }

// export interface Program extends State {
//   kind: "Program";
//   body: State[];
// }

// export interface VarDeclaration extends State {
//   kind: "VarDeclaration";
//   constant: boolean;
//   identifier: string;
//   value?: Expr;
//   dataType?: "string" | "integer" | "float";
// }

// export interface Expr extends State {}

// export interface BinExpr extends Expr {
//   kind: "BinExpr";
//   left: Expr;
//   right: Expr;
//   operator: string;
// }

// export interface Identifier extends Expr {
//   kind: "Identifier";
//   symbol: string;
// }

// export interface NumericLiteral extends Expr {
//   kind: "NumericLiteral";
//   value: number;
// }

// export interface VarAssignment extends Expr {
//   kind: "VarAssignment";
//   ident: string;
//   value: Expr;
// }

// export interface NullExpr extends Expr {
//   kind: "NullExpr";
// }

// export interface StringLiteral extends Expr {
//   kind: "StringLiteral";
//   value: string;
// }
