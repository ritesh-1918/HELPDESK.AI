"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useToken;
exports.unitless = exports.ignore = exports.getComputedToken = void 0;
var _react = _interopRequireDefault(require("react"));
var _cssinjs = require("@ant-design/cssinjs");
var _version = _interopRequireDefault(require("../version"));
var _context = require("./context");
var _seed = _interopRequireDefault(require("./themes/seed"));
var _alias = _interopRequireDefault(require("./util/alias"));
const unitless = exports.unitless = {
  lineHeight: true,
  lineHeightSM: true,
  lineHeightLG: true,
  lineHeightHeading1: true,
  lineHeightHeading2: true,
  lineHeightHeading3: true,
  lineHeightHeading4: true,
  lineHeightHeading5: true,
  opacityLoading: true,
  fontWeightStrong: true,
  zIndexPopupBase: true,
  zIndexBase: true,
  opacityImage: true
};
const ignore = exports.ignore = {
  motionBase: true,
  motionUnit: true
};
const preserve = {
  screenXS: true,
  screenXSMin: true,
  screenXSMax: true,
  screenSM: true,
  screenSMMin: true,
  screenSMMax: true,
  screenMD: true,
  screenMDMin: true,
  screenMDMax: true,
  screenLG: true,
  screenLGMin: true,
  screenLGMax: true,
  screenXL: true,
  screenXLMin: true,
  screenXLMax: true,
  screenXXL: true,
  screenXXLMin: true
};
const getComputedToken = (originToken, overrideToken, theme) => {
  const derivativeToken = theme.getDerivativeToken(originToken);
  const {
    override,
    ...components
  } = overrideToken;
  // Merge with override
  let mergedDerivativeToken = {
    ...derivativeToken,
    override
  };
  // Format if needed
  mergedDerivativeToken = (0, _alias.default)(mergedDerivativeToken);
  if (components) {
    Object.entries(components).forEach(([key, value]) => {
      const {
        theme: componentTheme,
        ...componentTokens
      } = value;
      let mergedComponentToken = componentTokens;
      if (componentTheme) {
        mergedComponentToken = getComputedToken({
          ...mergedDerivativeToken,
          ...componentTokens
        }, {
          override: componentTokens
        }, componentTheme);
      }
      mergedDerivativeToken[key] = mergedComponentToken;
    });
  }
  return mergedDerivativeToken;
};
// ================================== Hook ==================================
exports.getComputedToken = getComputedToken;
function useToken() {
  const {
    token: rootDesignToken,
    hashed,
    theme,
    override,
    cssVar: ctxCssVar,
    zeroRuntime
  } = _react.default.useContext(_context.DesignTokenContext);
  const cssVar = {
    prefix: ctxCssVar?.prefix ?? 'ant',
    key: ctxCssVar?.key ?? 'css-var-root'
  };
  const salt = `${_version.default}-${hashed || ''}`;
  const mergedTheme = theme || _context.defaultTheme;
  const [token, hashId, realToken] = (0, _cssinjs.useCacheToken)(mergedTheme, [_seed.default, rootDesignToken], {
    salt,
    override,
    getComputedToken,
    cssVar: {
      ...cssVar,
      unitless,
      ignore,
      preserve
    }
  });
  return [mergedTheme, realToken, hashed ? hashId : '', token, cssVar, !!zeroRuntime];
}