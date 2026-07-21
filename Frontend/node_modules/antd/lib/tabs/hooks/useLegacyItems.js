"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _warning = require("../../_util/warning");
function filter(items) {
  return items.filter(item => item);
}
function useLegacyItems(items, children) {
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Tabs');
    warning.deprecated(!children, 'Tabs.TabPane', 'items');
  }
  if (items) {
    return items.map(item => ({
      ...item,
      destroyOnHidden: item.destroyOnHidden ?? item.destroyInactiveTabPane
    }));
  }
  const childrenItems = (0, _util.toArray)(children).map(node => {
    if (/*#__PURE__*/React.isValidElement(node)) {
      const {
        key,
        props
      } = node;
      const {
        tab,
        ...restProps
      } = props || {};
      const item = {
        key: String(key),
        ...restProps,
        label: tab
      };
      return item;
    }
    return null;
  });
  return filter(childrenItems);
}
var _default = exports.default = useLegacyItems;