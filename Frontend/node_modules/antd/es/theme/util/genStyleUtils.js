import { useContext } from 'react';
import { genStyleUtils } from '@ant-design/cssinjs-utils';
import { ConfigContext, defaultIconPrefixCls } from '../../config-provider/context';
import { genCommonStyle, genIconStyle, genLinkStyle } from '../../style';
import useLocalToken, { unitless } from '../useToken';
export const {
  genStyleHooks,
  genComponentStyleHook,
  genSubStyleComponent
} = genStyleUtils({
  usePrefix: () => {
    const {
      getPrefixCls,
      iconPrefixCls
    } = useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();
    return {
      rootPrefixCls,
      iconPrefixCls
    };
  },
  useToken: () => {
    const [theme, realToken, hashId, token, cssVar, zeroRuntime] = useLocalToken();
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
    } = useContext(ConfigContext);
    return csp ?? {};
  },
  getResetStyles: (token, config) => {
    const linkStyle = genLinkStyle(token);
    return [linkStyle, {
      '&': linkStyle
    }, genIconStyle(config?.prefix.iconPrefixCls ?? defaultIconPrefixCls)];
  },
  getCommonStyle: genCommonStyle,
  getCompUnitless: () => unitless
});
export const genCssVar = (antCls, component) => {
  const cssPrefix = `--${antCls.replace(/\./g, '')}-${component}-`;
  const varName = name => {
    return `${cssPrefix}${name}`;
  };
  const varRef = (name, fallback) => {
    return fallback ? `var(${cssPrefix}${name}, ${fallback})` : `var(${cssPrefix}${name})`;
  };
  return [varName, varRef];
};