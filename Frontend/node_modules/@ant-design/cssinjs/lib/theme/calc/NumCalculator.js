"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _calculator = _interopRequireDefault(require("./calculator"));
class NumCalculator extends _calculator.default {
  result = 0;
  constructor(num) {
    super();
    if (num instanceof NumCalculator) {
      this.result = num.result;
    } else if (typeof num === 'number') {
      this.result = num;
    }
  }
  add(num) {
    if (num instanceof NumCalculator) {
      this.result += num.result;
    } else if (typeof num === 'number') {
      this.result += num;
    }
    return this;
  }
  sub(num) {
    if (num instanceof NumCalculator) {
      this.result -= num.result;
    } else if (typeof num === 'number') {
      this.result -= num;
    }
    return this;
  }
  mul(num) {
    if (num instanceof NumCalculator) {
      this.result *= num.result;
    } else if (typeof num === 'number') {
      this.result *= num;
    }
    return this;
  }
  div(num) {
    if (num instanceof NumCalculator) {
      this.result /= num.result;
    } else if (typeof num === 'number') {
      this.result /= num;
    }
    return this;
  }
  equal() {
    return this.result;
  }
}
exports.default = NumCalculator;