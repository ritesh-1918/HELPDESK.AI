"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Item = Item;
var React = _interopRequireWildcard(require("react"));
function Item({
  children,
  setRef
}) {
  const refFunc = React.useCallback(node => {
    setRef(node);
  }, []);
  return /*#__PURE__*/React.cloneElement(children, {
    ref: refFunc
  });
}