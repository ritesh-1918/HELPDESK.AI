"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isNonNullable = _interopRequireDefault(require("./isNonNullable"));
const toList = (candidate, skipEmpty = false) => {
  if (skipEmpty && !(0, _isNonNullable.default)(candidate)) {
    return [];
  }
  return Array.isArray(candidate) ? candidate : [candidate];
};
var _default = exports.default = toList;