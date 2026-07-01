"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useChildren;
var React = _interopRequireWildcard(require("react"));
var _Item = require("../Item");
function useChildren(list, startIndex, endIndex, scrollWidth, offsetX, setNodeRef, renderFunc, {
  getKey
}) {
  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const eleIndex = startIndex + index;
    const node = renderFunc(item, eleIndex, {
      style: {
        width: scrollWidth
      },
      offsetX
    });
    const key = getKey(item);
    return /*#__PURE__*/React.createElement(_Item.Item, {
      key: key,
      setRef: ele => setNodeRef(item, ele)
    }, node);
  });
}