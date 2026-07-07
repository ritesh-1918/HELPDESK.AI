"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
function getCollapsible(collapsible) {
  if (collapsible && typeof collapsible === 'object') {
    return {
      ...collapsible,
      showCollapsibleIcon: collapsible.showCollapsibleIcon === undefined ? 'auto' : collapsible.showCollapsibleIcon
    };
  }
  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible,
    showCollapsibleIcon: 'auto'
  };
}
/**
 * Convert `children` into `items`.
 */
function useItems(children) {
  const items = React.useMemo(() => (0, _util.toArray)(children).filter(item => /*#__PURE__*/React.isValidElement(item)).map(node => {
    const {
      props
    } = node;
    const {
      collapsible,
      ...restProps
    } = props;
    return {
      ...restProps,
      collapsible: getCollapsible(collapsible)
    };
  }), [children]);
  return items;
}
var _default = exports.default = useItems;