import { State, Program, Expr, BinExpr, NumericLiteral, Identifier, VarDeclaration } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";


export default class Parser {
    private tokens: Token[] = [];

    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    private atToken() {
        return this.tokens[0] as Token;
    }

    private eat() {
        const prev = this.tokens.shift() as Token;

        return prev;
    }

    private expect(type: TokenType, message: any) {
        const prev = this.tokens.shift() as Token;
        if(!prev || prev.type != type) {
            console.error("Parser error:\n", message, prev);
        }

        return prev;
    }

    public produceAST(src: string): Program {

        this.tokens = tokenize(src);

        const program: Program = {
            kind: "Program",
            body: [],
        };

        while(this.not_eof()) {
            program.body.push(this.parseState());
        }

        return program;
    }

    private parseState(): State {
        switch(this.atToken().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVarDec();

            default:
                return this.parseExpr();
        }
    }

    private parseVarDec(): State {
        const isConstant = this.eat().type == TokenType.Const;
        const id = this.expect(TokenType.Identifier, "Expected identifier name").value;

        if(this.atToken().type == TokenType.EndLine) {
            this.eat();

            if(isConstant) {
                throw "Must assign value";
            }

            return { 
                kind: "VarDeclaration", 
                identifier: id, 
                constant: false, 
            } as VarDeclaration;
        }

        this.expect(TokenType.Equals, "Expected '=' operator");

        const declaration = {
            kind: "VarDeclaration",
            value: this.parseExpr(), 
            identifier: id,
            constant: isConstant,
        } as VarDeclaration;

        this.expect(TokenType.EndLine, "Expected semicolon");

        return declaration;
    }
    
    private parseExpr(): Expr {
        return this.parseAddExpr();
    }

    private parseAddExpr(): Expr {
        let left = this.parseMultExpr();

        while(this.atToken().value == "+" || this.atToken().value == "-") {
            const operator = this.eat().value;
            const right = this.parseMultExpr();
            left = {
                kind: "BinExpr",
                left, 
                right, 
                operator
            } as BinExpr;
        }

        return left;
    }

    private parseMultExpr(): Expr {
        let left = this.parsePrimExpr();

        while(this.atToken().value == "*" || this.atToken().value == "/") {
            const operator = this.eat().value;
            const right = this.parsePrimExpr();
            left = {
                kind: "BinExpr",
                left, 
                right, 
                operator
            } as BinExpr;
        }

        return left;
    }

    private parsePrimExpr(): Expr {
        const token = this.atToken().type;
        
        switch(token) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier;
            case TokenType.Number:
                return { kind: "NumericLiteral", value: parseFloat(this.eat().value) } as NumericLiteral;
            case TokenType.OpenPar: 
                this.eat();
                const value = this.parseExpr();
                this.expect(TokenType.ClosePar, "')' expected.");
                return value;

            default:
                console.error("Unexpected token: ", this.atToken());
                return {} as State;
        }
    }
}