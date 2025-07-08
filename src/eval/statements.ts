import { Program, VariableAssignment, VariableDeclaration } from "@lhs/ast";
import Environment from "@lhs/environment";
import { evaluate } from "@lhs/interpreter";
import { RuntimeValue } from "@lhs/runtime-values";
import { ValueMaker } from "@lhs/value-maker";

export function evaluateProgram(
  program: Program,
  env: Environment,
): RuntimeValue<unknown> {
  let lastEval: RuntimeValue<unknown> = ValueMaker.makeNull();

  for (const state of program.body) {
    lastEval = evaluate(state, env);
  }

  return lastEval;
}

export function evaluateVarDec(
  declaration: VariableDeclaration,
  env: Environment,
): RuntimeValue<unknown> {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : ValueMaker.makeNull();
  return env.declareVariable({
    name: declaration.identifier,
    value: value,
    isConstant: declaration.isConstant,
    type: declaration.dataType,
  });
}

export function evaluateVarAssignment(
  stmt: VariableAssignment,
  env: Environment,
): RuntimeValue<unknown> {
  const value = evaluate(stmt.value, env);

  env.assignVariable({
    name: stmt.identifier,
    value: value,
  });

  return ValueMaker.makeNull();
}
