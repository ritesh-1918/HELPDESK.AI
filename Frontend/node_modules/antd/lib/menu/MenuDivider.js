"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _menu = require("@rc-component/menu");
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
const MenuDivider = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    dashed,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('menu', customizePrefixCls);
  const classString = (0, _clsx.clsx)({
    [`${prefixCls}-item-divider-dashed`]: !!dashed
  }, className);
  return /*#__PURE__*/React.createElement(_menu.Divider, {
    className: classString,
    ...restProps
  });
};
var _default = exports.default = MenuDivider;