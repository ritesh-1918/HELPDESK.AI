function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
import warning from "@rc-component/util/es/warning";
import * as React from 'react';

/**
 * Used for `useFilledProps` since it already in the React.useMemo
 */
export function fillClearIcon(prefixCls, allowClear, clearIcon) {
  if (process.env.NODE_ENV !== 'production' && clearIcon) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.');
  }
  if (allowClear === false) {
    return null;
  }
  var config = allowClear && _typeof(allowClear) === 'object' ? allowClear : {};
  return config.clearIcon || clearIcon || /*#__PURE__*/React.createElement("span", {
    className: "".concat(prefixCls, "-clear-btn")
  });
}