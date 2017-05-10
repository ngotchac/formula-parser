'use strict';

exports.__esModule = true;
exports['default'] = evaluate;

var _evaluateByOperator = require('./evaluate-by-operator/evaluate-by-operator');

var _evaluateByOperator2 = _interopRequireDefault(_evaluateByOperator);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _evaluate(object, options) {
  if (object && typeof object === 'object' && object.func) {
    var func = object.func,
        _object$args = object.args,
        args = _object$args === undefined ? [] : _object$args,
        value = object.value;

    var evalArgs = _evaluate(args, options);

    if (func === '_evaluateByOperator') {
      value = _evaluateByOperator2['default'].apply(undefined, evalArgs);

      if (value === undefined) {
        return true;
      }

      return value;
    }

    if (func === '_callVariable') {
      if (options.getVariable) {
        var nextValue = options.getVariable.apply(options, evalArgs);

        if (nextValue !== void 0) {
          value = nextValue;
        }
      }

      if (value === void 0) {
        throw Error(_error.ERROR_NAME);
      }

      return value;
    }

    if (func === '_callCellValue') {
      if (!options.getCellValue) {
        return value;
      }

      return options.getCellValue.apply(options, evalArgs);
    }

    if (func === '_callRangeValue') {
      if (!options.getRangeValue) {
        return value;
      }

      return options.getRangeValue.apply(options, evalArgs);
    }

    return value;
  }

  if (Array.isArray(object)) {
    return object.map(function (o) {
      return _evaluate(o, options);
    });
  }

  return object;
}

function evaluate(parsed, options) {
  var result = null;
  var error = null;

  try {
    result = _evaluate(parsed, options);
  } catch (ex) {
    var message = (0, _error2['default'])(ex.message);

    if (message) {
      error = message;
    } else {
      error = (0, _error2['default'])(_error.ERROR);
    }
  }

  if (result instanceof Error) {
    error = (0, _error2['default'])(result.message) || (0, _error2['default'])(_error.ERROR);
    result = null;
  }

  return {
    result: result,
    error: error
  };
}