"use strict";
"use client";

/* eslint-disable react/no-array-index-key */
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _BackTop = _interopRequireDefault(require("./BackTop"));
var _FloatButton = _interopRequireWildcard(require("./FloatButton"));
var _FloatButtonGroup = _interopRequireDefault(require("./FloatButtonGroup"));
const PureFloatButton = ({
  backTop,
  ...props
}) => backTop ? /*#__PURE__*/React.createElement(_BackTop.default, {
  ...props,
  visibilityHeight: 0
}) : /*#__PURE__*/React.createElement(_FloatButton.default, {
  ...props
});
/** @private Internal Component. Do not use in your production. */
const PurePanel = ({
  className,
  items,
  classNames: cls,
  styles,
  prefixCls: customizePrefixCls,
  ...restProps
}) => {
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls(_FloatButton.floatButtonPrefixCls, customizePrefixCls);
  const pureCls = `${prefixCls}-pure`;
  if (items) {
    return /*#__PURE__*/React.createElement(_FloatButtonGroup.default, {
      className: (0, _clsx.clsx)(className, pureCls),
      classNames: cls,
      styles: styles,
      ...restProps
    }, items.map((item, index) => (/*#__PURE__*/React.createElement(PureFloatButton, {
      key: index,
      ...item
    }))));
  }
  return /*#__PURE__*/React.createElement(PureFloatButton, {
    className: (0, _clsx.clsx)(className, pureCls),
    classNames: cls,
    styles: styles,
    ...restProps
  });
};
var _default = exports.default = PurePanel;