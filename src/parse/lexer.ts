const keywordTypes = ["let", "const", "func"] as const;
export type Keyword = (typeof keywordTypes)[number];
const operatorTypes = ["+", "-", "/", "*", "%", "="] as const;
export type Operator = (typeof operatorTypes)[number];
const composedOperators = [
  "+=",
  "-=",
  "/=",
  "*=",
  "%=",
  ">=",
  "<=",
] as const;
export type ComposedOperator = (typeof composedOperators)[number];

const signTypes = [
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ":",
  ";",
  ".",
  ",",
  "<",
  ">",
] as const;
export type Sign = (typeof signTypes)[number];

const composedSignTypes = ["==", "++"] as const;
export type ComposedSign = (typeof composedSignTypes)[number];

export type TokenType =
  | "keyword"
  | "string"
  | "identifier"
  | "equals"
  | "number"
  | "sign"
  | "operator"
  | "endLine"
  | "eof"
  | "skip";

function toKeyword(kw: Keyword): Token<"keyword"> {
  return {
    value: kw,
    type: "keyword",
  };
}

function toSign(sign: Sign | ComposedSign): Token<"sign"> {
  return {
    value: sign,
    type: "sign",
  };
}

const Keywords: Record<string, Token<"keyword">> =
  ((keywords: readonly Keyword[]) => {
    const result: Record<string, Token<"keyword">> = {};

    for (const kw of keywords) {
      result[kw] = toKeyword(kw);
    }

    return result;
  })(keywordTypes);

const ComposedSigns: Record<ComposedSign, Token<"sign">> =
  ((signs: readonly ComposedSign[]) => {
    const result: Record<string, Token<"sign">> = {};

    for (const sign of signs) {
      result[sign] = toSign(sign);
    }

    return result as Record<ComposedSign, Token<"sign">>;
  })(composedSignTypes);

const Signs: Record<Sign, Token<"sign">> = ((signs: readonly Sign[]) => {
  const result: Record<string, Token<"sign">> = {};

  for (const sign of signs) {
    result[sign] = toSign(sign);
  }

  return result as Record<Sign, Token<"sign">>;
})(signTypes);

const Operators: Record<Operator, Token<"operator">> =
  ((operators: readonly Operator[]) => {
    const result: Record<string, Token<"operator">> = {};

    for (const op of operators) {
      result[op] = toOperator(op);
    }

    return result as Record<Operator, Token<"operator">>;
  })(operatorTypes);

const ComposedOperators: Record<ComposedOperator, Token<"operator">> =
  ((operators: readonly ComposedOperator[]) => {
    const result: Record<string, Token<"operator">> = {};

    for (const op of operators) {
      result[op] = toOperator(op);
    }

    return result as Record<ComposedOperator, Token<"operator">>;
  })(composedOperators);

type Composable<T extends TokenType, K extends TokenType, V extends TokenType> =
  {
    first: Token<T>;
    second: Token<K>;
    result: Token<V>;
  };

const Composables: readonly Composable<TokenType, TokenType, TokenType>[] = [
  {
    first: Operators["+"],
    second: Operators["="],
    result: ComposedOperators["+="],
  },
  {
    first: Operators["-"],
    second: Operators["="],
    result: ComposedOperators["-="],
  },
  {
    first: Operators["*"],
    second: Operators["="],
    result: ComposedOperators["*="],
  },
  {
    first: Operators["/"],
    second: Operators["="],
    result: ComposedOperators["/="],
  },
  {
    first: Operators["%"],
    second: Operators["="],
    result: ComposedOperators["%="],
  },
  {
    first: Operators["="],
    second: Operators["="],
    result: ComposedSigns["=="],
  },
  {
    first: Operators["+"],
    second: Operators["+"],
    result: ComposedSigns["++"],
  },
];

export type TokenValue<T> = T extends "keyword" ? Keyword
  : T extends "identifier" ? string
  : T extends "string" ? string
  : T extends "number" ? number
  : T extends "datatypeDec" ? string
  : T extends "datatype" ? string
  : T extends "equals" ? string
  : T extends "operator" ? Operator | ComposedOperator
  : T extends "endLine" ? string
  : T extends "eof" ? string
  : T extends "skip" ? string
  : T extends "sign" ? Sign | ComposedSign
  : never;

export type Token<T extends TokenType> = {
  value: TokenValue<T>;
  type: T;
};

export class TokenUtils {
  static is<T extends TokenType>(
    target: Token<TokenType>,
    compare: Token<T>,
  ): boolean {
    return target.type == compare.type && target.value == compare.value;
  }

  static isValueAny<T extends TokenType>(
    token: Token<T>,
    type: T,
    values: TokenValue<T>[],
  ): [boolean, TokenValue<T> | null] {
    // console.log(.value);
    if (token.type == type) {
      if (values.includes(token.value)) {
        return [true, token.value];
      }
    }
    return [false, null];
  }
}

function toOperator(
  operator: Operator | ComposedOperator,
): Token<"operator"> {
  return {
    value: operator,
    type: "operator",
  };
}

function toToken<T extends TokenType>(value: TokenValue<T>, type: T): Token<T> {
  return { value, type };
}

function isAlpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

function isEmpty(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

function isInt(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];

  return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(input: string): Token<TokenType>[] {
  const tokens = new Array<Token<TokenType>>();
  const src = input.split("");

  let isMakingString = false;
  let stringMakingProcess = "";

  const maybeCompose = <T extends TokenType>(token: Token<T>) => {
    if (tokens.length > 0 && tokens[tokens.length - 1].type == "skip") {
      tokens.push(token);

      return;
    }
    const last = tokens[tokens.length - 1];
    for (const composable of Composables) {
      const satisfiesFirst = composable.first.type == last.type &&
        last.value == composable.first.value;
      const satisfiesSecond = composable.second.type == token.type &&
        token.value == composable.second.value;

      if (satisfiesFirst && satisfiesSecond) {
        tokens.pop();
        tokens.push(composable.result);

        return;
      }
    }
    tokens.push(token);
  };

  while (src.length > 0) {
    if (isEmpty(src[0])) {
      tokens.push(toToken(
        "",
        "skip" as const,
      ));
      src.shift();
      continue;
    }

    if (src[0] == "(") {
      tokens.push(toToken(src.shift()! as "(", "sign" as const));
    } else if (src[0] == ")") {
      tokens.push(toToken(src.shift()! as ")", "sign" as const));
    } else if (Operators[src[0] as keyof typeof Operators] != undefined) {
      maybeCompose(Operators[src.shift()! as keyof typeof Operators]);
    } else if (Signs[src[0] as keyof typeof Signs] != undefined) {
      maybeCompose(Signs[src.shift()! as keyof typeof Signs]);
    } else {
      if (src[0] == "\\" && src[1] == '"') {
        if (isMakingString) {
          stringMakingProcess += '"';
          src.shift();
          src.shift();
        }
      }

      if (src[0] == '"') {
        if (isMakingString) {
          tokens.push(toToken(stringMakingProcess, "string" as const));
        }
        stringMakingProcess = "";

        isMakingString = !isMakingString;

        src.shift();
        continue;
      }

      if (isMakingString) {
        const val = src.shift();

        stringMakingProcess = `${stringMakingProcess}${val}`;
        continue;
      }

      if (isInt(src[0])) {
        let num = "";

        while (src.length > 0 && isInt(src[0])) {
          num += src.shift();
        }

        tokens.push(toToken(parseFloat(num), "number" as const));
      } else if (isAlpha(src[0])) {
        let identifier = "";

        while (src.length > 0 && isAlpha(src[0])) {
          identifier += src.shift();
        }

        const reserved = Keywords[identifier];
        if (reserved != undefined) {
          tokens.push(reserved);
        } else {
          tokens.push(toToken(identifier, "identifier" as const));
        }
      } else {
        console.log("Unknown character: ", src[0]);
        Deno.exit();
      }
    }
  }

  tokens.push({ type: "eof", value: "EndOfFile" } as Token<"eof">);

  // console.log(tokens);
  return tokens.filter((v) => {
    return v.type != "skip";
  });
}
