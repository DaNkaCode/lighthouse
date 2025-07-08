import { BinaryExpression, Identifier } from "@lhs/ast";
import Environment from "@lhs/environment";
import { evaluate } from "@lhs/interpreter";
import { NumberRuntimeValue, RuntimeValue } from "@lhs/runtime-values";
import { ValueMaker } from "@lhs/value-maker";

function evaluateNumBinExpr(
  lp: NumberRuntimeValue,
  rp: NumberRuntimeValue,
  op: string,
): NumberRuntimeValue {
  let result: number = 0;

  if (op == "+") {
    result = lp.value + rp.value;
  } else if (op == "-") {
    result = lp.value - rp.value;
  } else if (op == "*") {
    result = lp.value * rp.value;
  } else if (op == "/") {
    result = lp.value / rp.value;
  } else if (op == "%") {
    result = lp.value % rp.value;
  }

  return new NumberRuntimeValue(result);
}

export function evaluateBinExpr(
  binOp: BinaryExpression,
  env: Environment,
): RuntimeValue<unknown> {
  const leftPart = evaluate(binOp.left, env);
  const rightPart = evaluate(binOp.right, env);

  if (
    leftPart instanceof NumberRuntimeValue &&
    rightPart instanceof NumberRuntimeValue
  ) {
    return evaluateNumBinExpr(
      leftPart as NumberRuntimeValue,
      rightPart as NumberRuntimeValue,
      binOp.operand,
    );
  }

  return ValueMaker.makeNull();
}

export function evaluateIdentifier(
  id: Identifier,
  env: Environment,
): RuntimeValue<unknown> {
  const val = env.readVariable(id.identifier, "value");
  return val;
}
