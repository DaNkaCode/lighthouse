// export type ValueType = "null" | "number" | "boolean";

import { DataType } from "@lhs/data-type";

export abstract class RuntimeValue<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  abstract dataType(): DataType;
}

export class NullRuntimeValue extends RuntimeValue<null> {
  override dataType(): DataType {
    return {
      type: "nil",
    };
  }
  constructor() {
    super(null);
  }
}

export class NumberRuntimeValue extends RuntimeValue<number> {
  override dataType(): DataType {
    return {
      type: "number",
    };
  }
}

export class BooleanRuntimeValue extends RuntimeValue<boolean> {
  override dataType(): DataType {
    return {
      type: "bool",
    };
  }
}

export class StringRuntimeValue extends RuntimeValue<string> {
  override dataType(): DataType {
    return {
      type: "string",
    };
  }
}

// export interface NullValue extends RuntimeValue {
//   type: "null";
//   value: null;
// }

// export interface NumberValue extends RuntimeValue {
//   type: "number";
//   value: number;
// }

// export interface BoolValue extends RuntimeValue {
//   type: "boolean";
//   value: boolean;
// }
