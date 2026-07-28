"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useChildren;
var _util = require("@rc-component/util");
function useChildren(children) {
  if (typeof children === 'function') {
    return children;
  }
  const childList = (0, _util.toArray)(children);
  return childList.length <= 1 ? childList[0] : childList;
}