"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useHasSider;
var _util = require("@rc-component/util");
var _Sider = _interopRequireDefault(require("../Sider"));
function useHasSider(siders, children, hasSider) {
  if (typeof hasSider === 'boolean') {
    return hasSider;
  }
  if (siders.length) {
    return true;
  }
  const childNodes = (0, _util.toArray)(children);
  return childNodes.some(node => node.type === _Sider.default);
}