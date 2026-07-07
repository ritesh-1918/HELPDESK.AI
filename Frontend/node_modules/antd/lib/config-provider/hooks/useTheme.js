"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTheme;
var _react = require("react");
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _warning = require("../../_util/warning");
var _internal = require("../../theme/internal");
function useTheme(theme, parentTheme, config) {
  const warning = (0, _warning.devUseWarning)('ConfigProvider');
  const themeConfig = theme || {};
  const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? {
    ..._internal.defaultConfig,
    hashed: parentTheme?.hashed ?? _internal.defaultConfig.hashed,
    cssVar: parentTheme?.cssVar
  } : parentTheme;
  // Generate a unique key for cssVar
  const themeKey = (0, _react.useId)();
  if (process.env.NODE_ENV !== 'production') {
    const cssVarEnabled = themeConfig.cssVar || parentThemeConfig.cssVar;
    const validKey = !!(typeof themeConfig.cssVar === 'object' && themeConfig.cssVar?.key || themeKey);
    process.env.NODE_ENV !== "production" ? warning(!cssVarEnabled || validKey, 'breaking', 'Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.') : void 0;
  }
  return (0, _useMemo.default)(() => {
    if (!theme) {
      return parentTheme;
    }
    // Override
    const mergedComponents = {
      ...parentThemeConfig.components
    };
    Object.keys(theme.components || {}).forEach(componentName => {
      mergedComponents[componentName] = {
        ...mergedComponents[componentName],
        ...theme.components[componentName]
      };
    });
    const cssVarKey = `css-var-${themeKey.replace(/:/g, '')}`;
    const mergedCssVar = {
      prefix: config?.prefixCls,
      // Same as prefixCls by default
      ...parentThemeConfig.cssVar,
      ...themeConfig.cssVar,
      key: themeConfig.cssVar?.key || cssVarKey
    };
    // Base token
    return {
      ...parentThemeConfig,
      ...themeConfig,
      token: {
        ...parentThemeConfig.token,
        ...themeConfig.token
      },
      components: mergedComponents,
      cssVar: mergedCssVar
    };
  }, [themeConfig, parentThemeConfig], (prev, next) => prev.some((prevTheme, index) => {
    const nextTheme = next[index];
    return !(0, _isEqual.default)(prevTheme, nextTheme, true);
  }));
}