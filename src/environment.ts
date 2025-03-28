import { RuntimeValue } from "@lhs/runtime-values";

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue<unknown>>;
  private constants: Set<string>;

  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
    this.constants = new Set();
  }

  public varDec(
    varName: string,
    value: RuntimeValue<unknown>,
    constant: boolean
  ): RuntimeValue<unknown> {
    if (this.variables.has(varName)) {
      throw `Variable declaration failed ${varName}. It already exists.`;
    }

    this.variables.set(varName, value);

    if (constant) {
      this.constants.add(varName);
    }

    return value;
  }

  public varAssign(
    varName: string,
    value: RuntimeValue<unknown>
  ): RuntimeValue<unknown> {
    const env = this.resolveVariable(varName);

    if (env.constants.has(varName)) {
      throw `Cannot reassign to variable ${varName} as it is constant`;
    }

    env.variables.set(varName, value);
    return value;
  }

  public lookUpVar(varName: string): RuntimeValue<unknown> {
    const env = this.resolveVariable(varName);
    return env.variables.get(varName) as RuntimeValue<unknown>;
  }

  /**
   * @throws
   */
  public resolveVariable(varName: string): Environment {
    if (this.variables.has(varName)) {
      return this;
    }
    if (this.parent == undefined) {
      throw `Cannot resolve ${varName}`;
    }

    return this.parent.resolveVariable(varName);
  }
}
