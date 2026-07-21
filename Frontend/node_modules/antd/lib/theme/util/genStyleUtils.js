"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genSubStyleComponent = exports.genStyleHooks = exports.genCssVar = exports.genComponentStyleHook = void 0;
var _react = require("react");
var _cssinjsUtils = require("@ant-design/cssinjs-utils");
var _context = require("../../config-provider/context");
var _style = require("../../style");
var _useToken = _interopRequireWildcard(require("../useToken"));
const {
  genStyleHooks,
  genComponentStyleHook,
  genSubStyleComponent
} = (0, _cssinjsUtils.genStyleUtils)({
  usePrefix: () => {
    const {
      getPrefixCls,
      iconPrefixCls
    } = (0, _react.useContext)(_context.ConfigContext);
    const rootPrefixCls = getPrefixCls();
    return {
      rootPrefixCls,
      iconPrefixCls
    };
  },
  useToken: () => {
    const [theme, realToken, hashId, token, cssVar, zeroRuntime] = (0, _useToken.default)();
    return {
      theme,
      realToken,
      hashId,
      token,
      cssVar,
      zeroRuntime
    };
  },
  useCSP: () => {
    const {
      csp
    } = (0, _react.useContext)(_context.ConfigContext);
    return csp ?? {};
  },
  getResetStyles: (token, config) => {
    const linkStyle = (0, _style.genLinkStyle)(token);
    return [linkStyle, {
      '&': linkStyle
    }, (0, _style.genIconStyle)(config?.prefix.iconPrefixCls ?? _context.defaultIconPrefixCls)];
  },
  getCommonStyle: _style.genCommonStyle,
  getCompUnitless: () => _useToken.unitless
});
exports.genSubStyleComponent = genSubStyleComponent;
exports.genComponentStyleHook = genComponentStyleHook;
exports.genStyleHooks = genStyleHooks;
const genCssVar = (antCls, component) => {
  const cssPrefix = `--${antCls.replace(/\./g, '')}-${component}-`;
  const varName = name => {
    return `${cssPrefix}${name}`;
  };
  const varRef = (name, fallback) => {
    return fallback ? `var(${cssPrefix}${name}, ${fallback})` : `var(${cssPrefix}${name})`;
  };
  return [varName, varRef];
};
exports.genCssVar = genCssVar;