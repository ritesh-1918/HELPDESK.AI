"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useItems;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _responsiveObserver = require("../../_util/responsiveObserver");
// Convert children into items
const transChildren2Items = childNodes => (0, _util.toArray)(childNodes).map(node => ({
  ...node?.props,
  key: node.key
}));
function useItems(screens, items, children) {
  const mergedItems = React.useMemo(() =>
  // Take `items` first or convert `children` into items
  items || transChildren2Items(children), [items, children]);
  const responsiveItems = React.useMemo(() => mergedItems.map(({
    span,
    ...restItem
  }) => {
    if (span === 'filled') {
      return {
        ...restItem,
        filled: true
      };
    }
    return {
      ...restItem,
      span: typeof span === 'number' ? span : (0, _responsiveObserver.matchScreen)(screens, span)
    };
  }), [mergedItems, screens]);
  return responsiveItems;
}