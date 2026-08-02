"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
const CardGrid = ({
  prefixCls,
  className,
  hoverable = true,
  ...rest
}) => {
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefix = getPrefixCls('card', prefixCls);
  const classString = (0, _clsx.clsx)(`${prefix}-grid`, className, {
    [`${prefix}-grid-hoverable`]: hoverable
  });
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: classString
  });
};
if (process.env.NODE_ENV !== 'production') {
  CardGrid.displayName = 'CardGrid';
}
var _default = exports.default = CardGrid;