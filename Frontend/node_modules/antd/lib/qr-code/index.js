"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _qrcode = require("@rc-component/qrcode");
var _util = require("@rc-component/util");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _locale = require("../locale");
var _internal = require("../theme/internal");
var _QrcodeStatus = _interopRequireDefault(require("./QrcodeStatus"));
var _index = _interopRequireDefault(require("./style/index"));
const QRCode = props => {
  const [, token] = (0, _internal.useToken)();
  const {
    value,
    type = 'canvas',
    icon = '',
    size = 160,
    iconSize,
    color = token.colorText,
    errorLevel = 'M',
    status = 'active',
    bordered = true,
    onRefresh,
    style,
    className,
    rootClassName,
    prefixCls: customizePrefixCls,
    bgColor = 'transparent',
    marginSize,
    statusRender,
    classNames,
    styles,
    boostLevel /* 👈 5.28.0+ */,
    ...rest
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('qrcode');
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    bgColor,
    type,
    size,
    status,
    bordered,
    errorLevel
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('qrcode', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _index.default)(prefixCls);
  const imageSettings = {
    src: icon,
    x: undefined,
    y: undefined,
    height: typeof iconSize === 'number' ? iconSize : iconSize?.height ?? 40,
    width: typeof iconSize === 'number' ? iconSize : iconSize?.width ?? 40,
    excavate: true,
    crossOrigin: 'anonymous'
  };
  const a11yProps = (0, _pickAttrs.default)(rest, true);
  const restProps = (0, _util.omit)(rest, Object.keys(a11yProps));
  const qrCodeProps = {
    value,
    size,
    level: errorLevel,
    bgColor,
    fgColor: color,
    style: {
      width: style?.width,
      height: style?.height
    },
    imageSettings: icon ? imageSettings : undefined,
    marginSize,
    boostLevel,
    ...a11yProps
  };
  const [locale] = (0, _locale.useLocale)('QRCode');
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('QRCode');
    process.env.NODE_ENV !== "production" ? warning(!!value, 'usage', 'need to receive `value` props') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(icon && errorLevel === 'L'), 'usage', 'ErrorLevel `L` is not recommended to be used with `icon`, for scanning result would be affected by low level.') : void 0;
  }
  if (!value) {
    return null;
  }
  const rootClassNames = (0, _clsx.clsx)(prefixCls, className, rootClassName, hashId, cssVarCls, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-borderless`]: !bordered
  });
  const rootStyle = {
    backgroundColor: bgColor,
    ...mergedStyles.root,
    ...contextStyle,
    ...style,
    width: style?.width ?? size,
    height: style?.height ?? size
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    ...restProps,
    className: rootClassNames,
    style: rootStyle
  }, status !== 'active' && (/*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-cover`, mergedClassNames.cover),
    style: mergedStyles.cover
  }, /*#__PURE__*/_react.default.createElement(_QrcodeStatus.default, {
    prefixCls: prefixCls,
    locale: locale,
    status: status,
    onRefresh: onRefresh,
    statusRender: statusRender
  }))), type === 'canvas' ? /*#__PURE__*/_react.default.createElement(_qrcode.QRCodeCanvas, {
    ...qrCodeProps
  }) : /*#__PURE__*/_react.default.createElement(_qrcode.QRCodeSVG, {
    ...qrCodeProps
  }));
};
if (process.env.NODE_ENV !== 'production') {
  QRCode.displayName = 'QRCode';
}
var _default = exports.default = QRCode;