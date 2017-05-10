'use strict';

exports.__esModule = true;
exports.SYMBOL = undefined;
exports['default'] = func;

var _decimal = require('decimal.js');

var _decimal2 = _interopRequireDefault(_decimal);

var _number = require('./../../helper/number');

var _error = require('./../../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var SYMBOL = exports.SYMBOL = '^';

function func(exp1, exp2) {
  if (!Number.isFinite((0, _number.toNumber)(exp2))) {
    throw Error(_error.ERROR_VALUE);
  }

  var result = new _decimal2['default']((0, _number.toNumber)(exp1)).toPower((0, _number.toNumber)(exp2)).toNumber();
  if (isNaN(result)) {
    throw Error(_error.ERROR_VALUE);
  }

  return result;
}

func.SYMBOL = SYMBOL;