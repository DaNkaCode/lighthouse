import {
  BinaryExpression,
  Expression,
  Identifier,
  NullExpression,
  NumericLiteral,
  Operand,
  Program,
  Statement,
  StringLiteral,
  VariableAssignment,
  VariableDeclaration,
} from "@lhs/ast";
import {
  Token,
  tokenize,
  type TokenType,
  TokenUtils,
  TokenValue,
} from "@lhs/lexer";

const operatorToOperand = (operator: string) => {
  switch (operator) {
    case "+":
      return Operand.Plus;
    case "-":
      return Operand.Minus;
    case "/":
      return Operand.Division;
    case "*":
      return Operand.Multiplication;
    case "%":
      return Operand.Modulo;
    default:
      console.error("Unknown operator: ", operator);
      Deno.exit(0);
  }
};

export default class Parser {
  private tokens: Token<TokenType>[] = [];

  private notEof(): boolean {
    return this.tokens[0] && this.tokens[0].type != "eof";
  }

  private atToken<T extends TokenType>(): Token<T> {
    return this.tokens[0] as Token<T>;
  }

  private peek<T extends TokenType>(i: number = 1) {
    return this.tokens[i] as Token<T>;
  }

  private eat<T extends TokenType>(): Token<T> {
    const prev = this.tokens.shift() as Token<T>;

    return prev;
  }

  private expect<T extends TokenType>(
    type: T,
    // deno-lint-ignore no-explicit-any
    message: any,
    value?: TokenValue<T>,
  ) {
    const prev = this.eat() as Token<T>;

    if (!prev || prev.type != type) {
      if (value && prev.value != value) {
        console.error("Parser error:\n", message, prev);
        return prev;
      }
      console.error("Parser error:\n", message, prev);
    }

    return prev;
  }

  public produceAST(src: string): Program {
    this.tokens = tokenize(src);
    console.log(this.tokens);

    const program: Program = new Program([]);

    while (this.notEof()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  private parseStatement(): Statement {
    switch (this.atToken().type) {
      case "keyword": {
        if (this.atToken().value == "let" || this.atToken().value == "const") {
          return this.parseVarDec();
        }
        return new NullExpression();
      }
      case "endLine":
        return new NullExpression();
      default:
        return this.parseExpr();
    }
  }

  private parseVarDec(): Statement {
    const isConstant = this.eat().value == "const";
    const id = this.expect(
      "identifier",
      "Expected an identifier as a name",
    ).value;

    if (this.atToken().type == "endLine") {
      this.eat();

      if (isConstant) {
        throw "Must assign a value";
      }

      return new VariableDeclaration(isConstant, id);
    }

    let type: string | null = null;

    if (
      TokenUtils.is(this.atToken(), { type: "sign", value: ":" })
    ) {
      this.eat();
      type = this.expect(
        "identifier",
        "Expected a type identifier",
      ).value;
    }

    this.expect("operator", "Expected '=' operator", "=");

    const declaration = new VariableDeclaration(
      isConstant,
      id,
      this.parseExpr(),
      type ? { type: type } : undefined,
    );

    this.expect("sign", "Expected a semicolon", ";");

    return declaration;
  }

  private parseExpr(): Expression {
    return this.parseAddExpr();
  }

  private parseAddExpr(): Expression {
    let left = this.parseMultExpr();

    while (this.atToken().value == "+" || this.atToken().value == "-") {
      const operator = this.eat<"operator">().value;
      const right = this.parseMultExpr();
      left = new BinaryExpression(left, right, operatorToOperand(operator));
    }

    return left;
  }

  private parseMultExpr(): Expression {
    let left = this.parseModExpr();

    while (this.atToken().value == "*" || this.atToken().value == "/") {
      const operator = this.eat<"operator">().value;
      const right = this.parseModExpr();
      left = new BinaryExpression(left, right, operatorToOperand(operator));
    }

    return left;
  }

  private parseModExpr(): Expression {
    let left = this.parsePrimExpr();

    while (this.atToken().value == "%") {
      const operator = this.eat<"operator">().value;
      const right = this.parsePrimExpr();
      left = new BinaryExpression(left, right, operatorToOperand(operator));
    }

    return left;
  }

  private parsePrimExpr(): Expression {
    const token = this.atToken();

    switch (token.type) {
      case "identifier": {
        const tryGetAssignment = TokenUtils.isValueAny(
          this.peek<"operator">(),
          "operator",
          ["=", "+=", "-=", "/=", "*=", "%="],
        );
        // console.log(JSON.stringify(tryGetAssignment));
        if (tryGetAssignment[0]) {
          return this.parseVarAssignment(tryGetAssignment[1]!);
        }

        return new Identifier(this.eat<"identifier">().value);
      }
      case "number":
        return new NumericLiteral(this.eat<"number">().value);
      case "string":
        return new StringLiteral(this.eat<"string">().value);
      case "sign": {
        if (token.value == "(") {
          this.eat();
          const value = this.parseExpr();
          this.expect("sign", "')' expected.", ")");
          return value;
        }
        return new NullExpression();
      }

      default:
        console.error("Unexpected token: ", this.atToken());
        Deno.exit();
    }
  }

  private parseVarAssignment(mode: string): Expression {
    const ident = this.eat<"identifier">();
    this.eat<"operator">(); // `=` | `+=` | `-=` | `/=` | `*=`

    const expr = this.parseExpr();

    const v: VariableAssignment = new VariableAssignment(
      ident.value,
      (() => {
        if (mode == "=") {
          return expr;
        } else {
          const modeModifier = mode[0];
          const operand = operatorToOperand(modeModifier);

          return new BinaryExpression(
            new Identifier(ident.value),
            expr,
            operand,
          );
        }
      })(),
    );

    this.expect("sign", "Expected a semicolon", ";");

    return v;
  }
}
