'use strict';

exports.__esModule = true;
exports.SYMBOL = undefined;
exports['default'] = func;

var _decimal = require('decimal.js');

var _decimal2 = _interopRequireDefault(_decimal);

var _error = require('./../../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var SYMBOL = exports.SYMBOL = '+';

function func(first) {
  try {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    var result = rest.reduce(function (acc, value) {
      return new _decimal2['default'](acc).plus(new _decimal2['default'](value)).toNumber();
    }, first);

    if (isNaN(result)) {
      throw Error(_error.ERROR_VALUE);
    }

    return result;
  } catch (error) {
    throw Error(_error.ERROR_VALUE);
  }
}

func.SYMBOL = SYMBOL;