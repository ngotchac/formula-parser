import evaluateByOperator from './evaluate-by-operator/evaluate-by-operator';
import errorParser, {ERROR, ERROR_NAME} from './error';

function _evaluate(object, options) {
  if (object && typeof object === 'object' && object.func) {
    let { func, args = [], value } = object;
    let evalArgs = _evaluate(args, options);

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
    return object.map((o) => _evaluate(o, options));
  }

  return object;
}

export default function evaluate(parsed, options) {
  let result = null;
  let error = null;

  try {
    result = _evaluate(parsed, options);
  } catch (ex) {
    const message = errorParser(ex.message);

    if (message) {
      error = message;
    } else {
      error = errorParser(ERROR);
    }
  }

  if (result instanceof Error) {
    error = errorParser(result.message) || errorParser(ERROR);
    result = null;
  }

  return {
    result,
    error,
  };
}
