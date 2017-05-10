const FormulaParser = require('./').Parser;

function getCellValue (cell) {
  console.warn('get cell', cell);
  return 2;
}

function getRangeValue (start, end) {
  console.warn('get range', start, end);
  return [ 1, 2 ];
}

function getVariable (name) {
  console.warn('get var', name);
  return 0;
}

const parser = new FormulaParser(getCellValue, getRangeValue, getVariable);

const result = parser.parse('SUM(A3, A1:A2)');

console.log(evaluate(result.result))


function evaluate (object) {
  console.warn('eval', object);

  if (typeof object === 'object' && object.function && object.arguments) {
    const func = object.function;
    const args = object.arguments;
    const dflt = object.default;

    const evaluatedArgs = args.map((arg) => evaluate(arg));
    const value = func.apply(func, evaluatedArgs);

    return value || dflt;
  }

  if (Array.isArray(object)) {
    return object.map((o) => evaluate(o));
  }

  return object;
}
