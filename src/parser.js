import Emitter from 'tiny-emitter';
import {Parser as GrammarParser} from './grammar-parser/grammar-parser';
import {trimEdges} from './helper/string';
import {toNumber, invertNumber} from './helper/number';
import errorParser, {isValidStrict as isErrorValid, ERROR} from './error';
import {extractLabel, toLabel} from './helper/cell';
import evaluate from './evaluate';

/**
 * @class Parser
 */
class Parser extends Emitter {
  constructor() {
    super();
    this.parser = new GrammarParser();
    this.parser.yy = {
      toNumber,
      trimEdges,
      invertNumber,
      throwError: (errorName) => this._throwError(errorName),
      callVariable: (variable) => this.callVariable(variable),
      evaluateByOperator: (...args) => this.evaluateByOperator(...args),
      callFunction: (...args) => this.evaluateByOperator(...args),
      cellValue: (value, sheet) => this.callCellValue(value, sheet),
      rangeValue: (start, end, sheet) => this.callRangeValue(start, end, sheet),
    };
    this.variables = Object.create(null);

    this
      .setVariable('TRUE', true)
      .setVariable('FALSE', false)
      .setVariable('NULL', null);
  }

  evaluate(object) {
    const options = {
      getVariable: (name) => {
        let value;

        this.emit('callVariable', name, (newValue) => {
          value = newValue;
        });

        return value;
      },

      getRangeValue: (startCell, endCell, sheet) => {
        let value = [];

        try {
          this.emit('callRangeValue', startCell, endCell, sheet, (_value) => {
            value = _value;
          });
        } catch (error) {
          if (!(error instanceof TypeError)) {
            throw error;
          }

          this.emit('callRangeValue', startCell, endCell, (_value) => {
            value = _value;
          });
        }

        return value;
      },

      getCellValue: (cellCoordinate, sheet) => {
        let value = void 0;

        try {
          this.emit('callCellValue', cellCoordinate, sheet, (_value) => {
            value = _value;
          });
        } catch (error) {
          if (!(error instanceof TypeError)) {
            throw error;
          }

          this.emit('callCellValue', cellCoordinate, (_value) => {
            value = _value;
          });
        }

        return value;
      },
    };

    return evaluate(object, options);
  }
  /**
   * Parse formula expression.
   *
   * @param {String} expression to parse.
   * @return {*} Returns an object with tow properties `error` and `result`.
   */
  parse(expression) {
    let result = null;
    let parsed = null;
    let error = null;

    try {
      if (expression === '') {
        parsed = '';
      } else {
        parsed = this.parser.parse(expression);
      }

      result = this.evaluate(parsed);
    } catch (ex) {
      // console.error(ex)
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

  /**
   * Set predefined variable name which can be visible while parsing formula expression.
   *
   * @param {String} name Variable name.
   * @param {*} value Variable value.
   * @returns {Parser}
   */
  setVariable(name, value) {
    this.variables[name] = value;

    return this;
  }

  /**
   * Get variable name.
   *
   * @param {String} name Variable name.
   * @returns {*}
   */
  getVariable(name) {
    return this.variables[name];
  }

  _callVariable(name) {
    return this.evaluate(this.callVariable(name));
  }

  _callCellValue(label, sheet) {
    return this.evaluate(this.callCellValue(label, sheet));
  }

  _callRangeValue(startLabel, endLabel, sheet) {
    return this.evaluate(this.callRangeValue(startLabel, endLabel, sheet));
  }

  evaluateByOperator(...args) {
    return {
      func: '_evaluateByOperator',
      args,
    };
  }

  /**
   * Retrieve variable value by its name.
   *
   * @param name Variable name.
   * @returns {*}
   * @private
   */
  callVariable(name) {
    let value = this.getVariable(name);

    return {
      func: '_callVariable',
      args: [name],
      value,
    };
  }

  /**
   * Retrieve value by its label (`B3`, `B$3`, `B$3`, `$B$3`).
   *
   * @param {String} label Coordinates.
   * @param {String} sheet Reference sheet name
   * @returns {*}
   * @private
   */
  callCellValue(label, sheet) {
    label = label.toUpperCase();
    const [row, column] = extractLabel(label);

    let cellCoordinate = sheet
      ? {label, row, column, sheet}
      : {label, row, column};

    return {
      func: '_callCellValue',
      args: [cellCoordinate],
      value: void 0,
    };
  }

  /**
   * Retrieve value by its label (`B3:A1`, `B$3:A1`, `B$3:$A1`, `$B$3:A$1`).
   *
   * @param {String} startLabel Coordinates of the first cell.
   * @param {String} endLabel Coordinates of the last cell.
   * @param {String} sheet Reference sheet name
   * @returns {Array} Returns an array of mixed values.
   * @private
   */
  callRangeValue(startLabel, endLabel, sheet) {
    startLabel = startLabel.toUpperCase();
    endLabel = endLabel.toUpperCase();

    const [startRow, startColumn] = extractLabel(startLabel);
    const [endRow, endColumn] = extractLabel(endLabel);
    let startCell = {};
    let endCell = {};

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

    startCell.label = toLabel(startCell.row, startCell.column);
    endCell.label = toLabel(endCell.row, endCell.column);

    if (sheet) {
      startCell.sheet = sheet;
      endCell.sheet = sheet;
    }

    return {
      func: '_callRangeValue',
      args: [startCell, endCell],
      value: [],
    };
  }

  /**
   * Try to throw error by its name.
   *
   * @param {String} errorName Error name.
   * @returns {String}
   * @private
   */
  _throwError(errorName) {
    if (isErrorValid(errorName)) {
      throw Error(errorName);
    }

    throw Error(ERROR);
  }
}

export default Parser;
