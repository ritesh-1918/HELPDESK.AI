"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _colorPicker = require("@rc-component/color-picker");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _locale = require("../../locale");
var _util = require("../util");
var _ColorClear = _interopRequireDefault(require("./ColorClear"));
const ColorTrigger = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    color,
    prefixCls,
    open,
    disabled,
    format,
    className,
    style,
    classNames,
    styles,
    showText,
    activeIndex,
    ...rest
  } = props;
  const colorTriggerPrefixCls = `${prefixCls}-trigger`;
  const colorTextPrefixCls = `${colorTriggerPrefixCls}-text`;
  const colorTextCellPrefixCls = `${colorTextPrefixCls}-cell`;
  const [locale] = (0, _locale.useLocale)('ColorPicker');
  // ============================== Text ==============================
  const desc = _react.default.useMemo(() => {
    if (!showText) {
      return '';
    }
    if (typeof showText === 'function') {
      return showText(color);
    }
    if (color.cleared) {
      return locale.transparent;
    }
    if (color.isGradient()) {
      return color.getColors().map((c, index) => {
        const inactive = activeIndex !== -1 && activeIndex !== index;
        return /*#__PURE__*/_react.default.createElement("span", {
          key: index,
          className: (0, _clsx.clsx)(colorTextCellPrefixCls, inactive && `${colorTextCellPrefixCls}-inactive`)
        }, c.color.toRgbString(), " ", c.percent, "%");
      });
    }
    const hexString = color.toHexString().toUpperCase();
    const alpha = (0, _util.getColorAlpha)(color);
    switch (format) {
      case 'rgb':
        return color.toRgbString();
      case 'hsb':
        return color.toHsbString();
      // case 'hex':
      default:
        return alpha < 100 ? `${hexString.slice(0, 7)},${alpha}%` : hexString;
    }
  }, [color, format, showText, activeIndex, locale.transparent, colorTextCellPrefixCls]);
  // ============================= Render =============================
  const containerNode = (0, _react.useMemo)(() => color.cleared ? (/*#__PURE__*/_react.default.createElement(_ColorClear.default, {
    prefixCls: prefixCls,
    className: classNames.body,
    style: styles.body
  })) : (/*#__PURE__*/_react.default.createElement(_colorPicker.ColorBlock, {
    prefixCls: prefixCls,
    color: color.toCssString(),
    className: classNames.body,
    innerClassName: classNames.content,
    style: styles.body,
    innerStyle: styles.content
  })), [color, prefixCls, classNames.body, classNames.content, styles.body, styles.content]);
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    className: (0, _clsx.clsx)(colorTriggerPrefixCls, className, classNames.root, {
      [`${colorTriggerPrefixCls}-active`]: open,
      [`${colorTriggerPrefixCls}-disabled`]: disabled
    }),
    style: {
      ...styles.root,
      ...style
    },
    ...(0, _pickAttrs.default)(rest)
  }, containerNode, showText && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(colorTextPrefixCls, classNames.description),
    style: styles.description
  }, desc)));
});
var _default = exports.default = ColorTrigger;