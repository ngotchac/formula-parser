import evaluateByOperator from './evaluate-by-operator/evaluate-by-operator';
import {ERROR_NAME} from './error';

export default function evaluate(object, options) {
  if (typeof object === 'object' && object.func) {
    let { func, args = [], value } = object;
    let evalArgs = evaluate(args, options);

    if (func === '_evaluateByOperator') {
      value = evaluateByOperator(...evalArgs);

      if (value === undefined) {
        return true;
      }

      return value;
    }

    if (func === '_callVariable') {
      if (options.getVariable) {
        const nextValue = options.getVariable(...evalArgs);

        if (nextValue !== void 0) {
          value = nextValue;
        }
      }

      if (value === void 0) {
        throw Error(ERROR_NAME);
      }

      return value;
    }

    if (func === '_callCellValue') {
      if (!options.getCellValue) {
        return value;
      }

      return options.getCellValue(...evalArgs);
    }

    if (func === '_callRangeValue') {
      if (!options.getRangeValue) {
        return value;
      }

      return options.getRangeValue(...evalArgs);
    }

    return value;
  }

  if (Array.isArray(object)) {
    return object.map((o) => evaluate(o, options));
  }

  return object;
}
