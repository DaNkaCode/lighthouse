export type DataType = {
  // deno-lint-ignore ban-types
  type: PrimitiveDataType | (string & {});
};

export type PrimitiveDataType = "number" | "string" | "bool" | "nil";

export class DataTypeUtils {
  static is(target: DataType, compare: DataType): boolean {
    return target.type === compare.type;
  }
}
