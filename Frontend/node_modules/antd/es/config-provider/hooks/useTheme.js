import { useId } from 'react';
import useMemo from "@rc-component/util/es/hooks/useMemo";
import isEqual from "@rc-component/util/es/isEqual";
import { devUseWarning } from '../../_util/warning';
import { defaultConfig } from '../../theme/internal';
export default function useTheme(theme, parentTheme, config) {
  const warning = devUseWarning('ConfigProvider');
  const themeConfig = theme || {};
  const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? {
    ...defaultConfig,
    hashed: parentTheme?.hashed ?? defaultConfig.hashed,
    cssVar: parentTheme?.cssVar
  } : parentTheme;
  // Generate a unique key for cssVar
  const themeKey = useId();
  if (process.env.NODE_ENV !== 'production') {
    const cssVarEnabled = themeConfig.cssVar || parentThemeConfig.cssVar;
    const validKey = !!(typeof themeConfig.cssVar === 'object' && themeConfig.cssVar?.key || themeKey);
    process.env.NODE_ENV !== "production" ? warning(!cssVarEnabled || validKey, 'breaking', 'Missing key in `cssVar` config. Please upgrade to React 18 or set `cssVar.key` manually in each ConfigProvider inside `cssVar` enabled ConfigProvider.') : void 0;
  }
  return useMemo(() => {
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
    return !isEqual(prevTheme, nextTheme, true);
  }));
}