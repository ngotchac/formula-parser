'use strict';

exports.__esModule = true;
exports['default'] = evaluate;

var _evaluateByOperator = require('./evaluate-by-operator/evaluate-by-operator');

var _evaluateByOperator2 = _interopRequireDefault(_evaluateByOperator);

var _error = require('./error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function evaluate(object, options) {
  if (typeof object === 'object' && object.func) {
    var func = object.func,
        _object$args = object.args,
        args = _object$args === undefined ? [] : _object$args,
        value = object.value;

    var evalArgs = evaluate(args, options);

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
      return evaluate(o, options);
    });
  }

  return object;
}