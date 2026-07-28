"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Cell = _interopRequireDefault(require("./Cell"));
var _Row = _interopRequireDefault(require("./Row"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Syntactic sugar. Do not support HOC.
 */
const Summary = props => {
  const {
    children
  } = props;
  return children;
};
Summary.Row = _Row.default;
Summary.Cell = _Cell.default;
var _default = exports.default = Summary;