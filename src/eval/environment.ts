import { RuntimeValue } from "@lhs/runtime-values";
import { DataType, DataTypeUtils } from "@lhs/data-type";
import { ValueMaker } from "@lhs/value-maker";

export type VariableAssignmentProperties = {
  name: string;
  value: RuntimeValue<unknown>;
};

export type VariableDeclarationProperties = VariableAssignmentProperties & {
  isConstant: boolean;
  type?: DataType;
};

type Variable = {
  name: string;
  value: RuntimeValue<unknown>;
  type: DataType;
  isConstant: boolean;
};

type ReadVariableMode = "data" | "value";

type ReadVariableReturnType<T extends ReadVariableMode> = T extends "data"
  ? Variable
  : T extends "value" ? RuntimeValue<unknown>
  : never;

class VariableReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VariableNotDefined";
  }
}

class VariableWriteError extends Error {
  constructor(name: string, message: string) {
    super(
      `VariableWriteError for variable "${name}": ${
        message.replaceAll("%s", name)
      }`,
    );
    this.name = "VariableWriteError";
  }
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, Variable>;

  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
  }

  static default(): Environment {
    const env = new Environment();
    env.declareVariable({
      name: "true",
      value: ValueMaker.makeBool(true),
      isConstant: true,
      type: {
        type: "bool",
      },
    });

    env.declareVariable({
      name: "false",
      value: ValueMaker.makeBool(false),
      isConstant: true,
      type: {
        type: "bool",
      },
    });
    env.declareVariable({
      name: "null",
      value: ValueMaker.makeNull(),
      isConstant: true,
      type: {
        type: "nil",
      },
    });

    return env;
  }

  public declareVariable(
    props: VariableDeclarationProperties,
  ): RuntimeValue<unknown> {
    if (this.variables.has(props.name)) {
      throw new VariableWriteError(
        props.name,
        `Declaration of the variable "%s" failed as it's already declared in the current scope.`,
      );
    }

    if (
      props.type != undefined &&
      !DataTypeUtils.is(props.value.dataType(), props.type)
    ) {
      throw new VariableWriteError(
        props.name,
        `Declaration of the variable "%s" failed as the value type "${props.value.dataType().type}" does not match the declared type "${props.type.type}".`,
      );
    }

    this.variables.set(props.name, {
      value: props.value,
      type: props.type ?? props.value.dataType(),
      isConstant: props.isConstant,
      name: props.name,
    });

    return props.value;
  }

  public assignVariable(
    props: VariableAssignmentProperties,
  ): RuntimeValue<unknown> {
    const env = this.searchForVariable(props.name);
    const variable = this.readVariable(props.name, "data");

    if (
      variable == undefined || variable.isConstant
    ) {
      throw new VariableWriteError(
        props.name,
        `Cannot reassign the variable "%s" as it is a constant.`,
      );
    }

    if (
      !DataTypeUtils.is(variable.type, props.value.dataType())
    ) {
      throw new VariableWriteError(
        props.name,
        `Cannot assign the value of type "${props.value.dataType().type}" to the variable "%s" as it is declared as "${variable.type.type}".`,
      );
    }

    env.variables.set(variable.name, {
      name: variable.name,
      value: props.value,
      isConstant: variable.isConstant,
      type: variable.type,
    });

    return props.value;
  }

  public readVariable<T extends ReadVariableMode>(
    varName: string,
    mode: T = "value" as T,
  ): ReadVariableReturnType<T> {
    const env = this.searchForVariable(varName);
    const variable = env.variables.get(varName);

    if (variable == undefined) {
      throw new VariableReadError(
        `Variable "${varName}" is not defined in the current scope.`,
      );
    }

    if (mode == "value") {
      return env.variables.get(varName)!.value as ReadVariableReturnType<T>;
    } else {
      const env = this.searchForVariable(varName);
      return env.variables.get(varName) as ReadVariableReturnType<T>;
    }
  }

  /**
   * @throws
   */
  public searchForVariable(varName: string): Environment {
    console.log(...this.variables);
    if (this.variables.has(varName)) {
      return this;
    } else if (this.parent != undefined) {
      return this.parent.searchForVariable(varName);
    } else {
      throw `Cannot resolve ${varName}`;
    }
  }
}
