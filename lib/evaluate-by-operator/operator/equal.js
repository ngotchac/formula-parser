'use strict';

exports.__esModule = true;
exports['default'] = func;
var SYMBOL = exports.SYMBOL = '=';

function func(exp1, exp2) {
  if (typeof exp1 === 'string' && typeof exp2 === 'string') {
    return exp1.toUpperCase() === exp2.toUpperCase();
  }

  return exp1 === exp2;
}

func.SYMBOL = SYMBOL;