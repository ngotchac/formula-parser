'use strict';

exports.__esModule = true;

var _tinyEmitter = require('tiny-emitter');

var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

var _grammarParser = require('./grammar-parser/grammar-parser');

var _string = require('./helper/string');

var _number = require('./helper/number');

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

var _cell = require('./helper/cell');

var _evaluate2 = require('./evaluate');

var _evaluate3 = _interopRequireDefault(_evaluate2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class Parser
 */
var Parser = function (_Emitter) {
  _inherits(Parser, _Emitter);

  function Parser() {
    _classCallCheck(this, Parser);

    var _this = _possibleConstructorReturn(this, _Emitter.call(this));

    _this.parser = new _grammarParser.Parser();
    _this.parser.yy = {
      toNumber: _number.toNumber,
      trimEdges: _string.trimEdges,
      invertNumber: _number.invertNumber,
      throwError: function throwError(errorName) {
        return _this._throwError(errorName);
      },
      callVariable: function callVariable(variable) {
        return _this.callVariable(variable);
      },
      evaluateByOperator: function evaluateByOperator() {
        return _this.evaluateByOperator.apply(_this, arguments);
      },
      callFunction: function callFunction() {
        return _this.evaluateByOperator.apply(_this, arguments);
      },
      cellValue: function cellValue(value, sheet) {
        return _this.callCellValue(value, sheet);
      },
      rangeValue: function rangeValue(start, end, sheet) {
        return _this.callRangeValue(start, end, sheet);
      }
    };
    _this.variables = Object.create(null);

    _this.setVariable('TRUE', true).setVariable('FALSE', false).setVariable('NULL', null);
    return _this;
  }

  Parser.prototype.evaluate = function evaluate(object) {
    var _this2 = this;

    var options = {
      getVariable: function getVariable(name) {
        var value = void 0;

        _this2.emit('callVariable', name, function (newValue) {
          value = newValue;
        });

        return value;
      },

      getRangeValue: function getRangeValue(startCell, endCell) {
        var value = [];

        _this2.emit('callRangeValue', startCell, endCell, function (_value) {
          value = _value;
        });

        return value;
      },

      getCellValue: function getCellValue(cellCoordinate) {
        var value = void 0;

        _this2.emit('callCellValue', cellCoordinate, function (_value) {
          value = _value;
        });

        return value;
      }
    };

    return (0, _evaluate3['default'])(object, options);
  };
  /**
   * Parse formula expression.
   *
   * @param {String} expression to parse.
   * @return {*} Returns an object with tow properties `error` and `result`.
   */


  Parser.prototype.parse = function parse(expression) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$evaluate = options.evaluate,
        evaluate = _options$evaluate === undefined ? true : _options$evaluate;


    var result = null;
    var parsed = null;
    var error = null;

    try {
      if (expression === '') {
        parsed = '';
      } else {
        parsed = this.parser.parse(expression);
      }
    } catch (ex) {
      // console.error(ex)
      var message = (0, _error2['default'])(ex.message);

      if (message) {
        error = message;
      } else {
        error = (0, _error2['default'])(_error.ERROR);
      }
    }

    if (!evaluate) {
      return {
        parsed: parsed,
        error: error
      };
    }

    if (!error) {
      try {
        result = this.evaluate(parsed);
      } catch (ex) {
        // console.error(ex)
        var _message = (0, _error2['default'])(ex.message);

        if (_message) {
          error = _message;
        } else {
          error = (0, _error2['default'])(_error.ERROR);
        }
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
  };

  /**
   * Set predefined variable name which can be visible while parsing formula expression.
   *
   * @param {String} name Variable name.
   * @param {*} value Variable value.
   * @returns {Parser}
   */


  Parser.prototype.setVariable = function setVariable(name, value) {
    this.variables[name] = value;

    return this;
  };

  /**
   * Get variable name.
   *
   * @param {String} name Variable name.
   * @returns {*}
   */


  Parser.prototype.getVariable = function getVariable(name) {
    return this.variables[name];
  };

  Parser.prototype._callVariable = function _callVariable(name) {
    return this.evaluate(this.callVariable(name));
  };

  Parser.prototype._callCellValue = function _callCellValue(label, sheet) {
    return this.evaluate(this.callCellValue(label, sheet));
  };

  Parser.prototype._callRangeValue = function _callRangeValue(startLabel, endLabel, sheet) {
    return this.evaluate(this.callRangeValue(startLabel, endLabel, sheet));
  };

  Parser.prototype.evaluateByOperator = function evaluateByOperator() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return {
      func: '_evaluateByOperator',
      args: args
    };
  };

  /**
   * Retrieve variable value by its name.
   *
   * @param name Variable name.
   * @returns {*}
   * @private
   */


  Parser.prototype.callVariable = function callVariable(name) {
    var value = this.getVariable(name);

    return {
      func: '_callVariable',
      args: [name],
      value: value
    };
  };

  /**
   * Retrieve value by its label (`B3`, `B$3`, `B$3`, `$B$3`).
   *
   * @param {String} label Coordinates.
   * @param {String} sheet Reference sheet name
   * @returns {*}
   * @private
   */


  Parser.prototype.callCellValue = function callCellValue(label, sheet) {
    label = label.toUpperCase();

    var _extractLabel = (0, _cell.extractLabel)(label),
        row = _extractLabel[0],
        column = _extractLabel[1];

    var cellCoordinate = sheet ? { label: label, row: row, column: column, sheet: sheet } : { label: label, row: row, column: column };

    return {
      func: '_callCellValue',
      args: [cellCoordinate],
      value: void 0
    };
  };

  /**
   * Retrieve value by its label (`B3:A1`, `B$3:A1`, `B$3:$A1`, `$B$3:A$1`).
   *
   * @param {String} startLabel Coordinates of the first cell.
   * @param {String} endLabel Coordinates of the last cell.
   * @param {String} sheet Reference sheet name
   * @returns {Array} Returns an array of mixed values.
   * @private
   */


  Parser.prototype.callRangeValue = function callRangeValue(startLabel, endLabel, sheet) {
    startLabel = startLabel.toUpperCase();
    endLabel = endLabel.toUpperCase();

    var _extractLabel2 = (0, _cell.extractLabel)(startLabel),
        startRow = _extractLabel2[0],
        startColumn = _extractLabel2[1];

    var _extractLabel3 = (0, _cell.extractLabel)(endLabel),
        endRow = _extractLabel3[0],
        endColumn = _extractLabel3[1];

    var startCell = {};
    var endCell = {};

    if (startRow.index <= endRow.index) {
      startCell.row = startRow;
      endCell.row = endRow;
    } else {
      startCell.row = endRow;
      endCell.row = startRow;
    }

    if (startColumn.index <= endColumn.index) {
      startCell.column = startColumn;
      endCell.column = endColumn;
    } else {
      startCell.column = endColumn;
      endCell.column = startColumn;
    }

    startCell.label = (0, _cell.toLabel)(startCell.row, startCell.column);
    endCell.label = (0, _cell.toLabel)(endCell.row, endCell.column);

    if (sheet) {
      startCell.sheet = sheet;
      endCell.sheet = sheet;
    }

    return {
      func: '_callRangeValue',
      args: [startCell, endCell],
      value: []
    };
  };

  /**
   * Try to throw error by its name.
   *
   * @param {String} errorName Error name.
   * @returns {String}
   * @private
   */


  Parser.prototype._throwError = function _throwError(errorName) {
    if ((0, _error.isValidStrict)(errorName)) {
      throw Error(errorName);
    }

    throw Error(_error.ERROR);
  };

  return Parser;
}(_tinyEmitter2['default']);

exports['default'] = Parser;