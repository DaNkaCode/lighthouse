export type NodeType =
  | "Program"
  | "VarDeclaration"

  | "NumericLiteral"
  | "Identifier"
  | "BinExpr"


export interface State {
    kind: NodeType;
}

export interface Program extends State {
    kind: "Program";
    body: State[];
}

export interface VarDeclaration extends State {
    kind: "VarDeclaration";
    constant: boolean;
    identifier: string;
    value?: Expr;
}

export interface Expr extends State { }

export interface BinExpr extends Expr {
    kind: "BinExpr";
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}
