"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _BreadcrumbContext = _interopRequireDefault(require("./BreadcrumbContext"));
const BreadcrumbSeparator = ({
  children
}) => {
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('breadcrumb');
  const breadcrumbContext = React.useContext(_BreadcrumbContext.default);
  const {
    classNames: mergedClassNames,
    styles: mergedStyles
  } = breadcrumbContext;
  return /*#__PURE__*/React.createElement("li", {
    className: (0, _clsx.clsx)(`${prefixCls}-separator`, mergedClassNames?.separator),
    style: mergedStyles?.separator,
    "aria-hidden": "true"
  }, children === '' ? children : children || '/');
};
BreadcrumbSeparator.__ANT_BREADCRUMB_SEPARATOR = true;
var _default = exports.default = BreadcrumbSeparator;