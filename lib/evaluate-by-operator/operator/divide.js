'use strict';

exports.__esModule = true;
exports.SYMBOL = undefined;
exports['default'] = func;

var _decimal = require('decimal.js');

var _decimal2 = _interopRequireDefault(_decimal);

var _number = require('./../../helper/number');

var _error = require('./../../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var SYMBOL = exports.SYMBOL = '/';

function func(first) {
  try {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    var result = rest.reduce(function (acc, value) {
      var tempValue = new _decimal2['default'](acc).div(new _decimal2['default']((0, _number.toNumber)(value))).toNumber();
      if (tempValue === Infinity || tempValue === -Infinity) {
        throw Error(_error.ERROR_DIV_ZERO);
      }

      return tempValue;
    }, (0, _number.toNumber)(first));

    if (isNaN(result)) {
      throw Error(_error.ERROR_VALUE);
    }

    return result;
  } catch (error) {
    if (error.message === _error.ERROR_DIV_ZERO) {
      throw Error(_error.ERROR_DIV_ZERO);
    }

    throw Error(_error.ERROR_VALUE);
  }
}

func.SYMBOL = SYMBOL;