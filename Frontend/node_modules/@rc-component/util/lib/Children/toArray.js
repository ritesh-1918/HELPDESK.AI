"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toArray;
var _isFragment = _interopRequireDefault(require("../React/isFragment"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function toArray(children, option = {}) {
  let ret = [];
  _react.default.Children.forEach(children, child => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if ((0, _isFragment.default)(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}