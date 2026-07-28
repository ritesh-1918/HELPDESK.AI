import { where } from "../util";
export const token2CSSVar = (token, prefix = '') => {
  return `--${prefix ? `${prefix}-` : ''}${token}`.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2').replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
};
export const serializeCSSVar = (cssVars, hashId, options) => {
  const {
    hashCls,
    hashPriority = 'low',
    scope
  } = options || {};
  if (!Object.keys(cssVars).length) {
    return '';
  }
  const baseSelector = `${where({
    hashCls,
    hashPriority
  })}.${hashId}`;
  const scopes = [scope].flat().filter(Boolean);
  const selector = scopes.length ? scopes.map(s => `${baseSelector}.${s}`).join(', ') : baseSelector;
  return `${selector}{${Object.entries(cssVars).map(([key, value]) => `${key}:${value};`).join('')}}`;
};
export const transformToken = (token, themeKey, config) => {
  const {
    hashCls,
    hashPriority = 'low',
    prefix,
    unitless,
    ignore,
    preserve
  } = config || {};
  const cssVars = {};
  const result = {};
  Object.entries(token).forEach(([key, value]) => {
    if (preserve?.[key]) {
      result[key] = value;
    } else if ((typeof value === 'string' || typeof value === 'number') && !ignore?.[key]) {
      const cssVar = token2CSSVar(key, prefix);
      cssVars[cssVar] = typeof value === 'number' && !unitless?.[key] ? `${value}px` : String(value);
      result[key] = `var(${cssVar})`;
    }
  });
  return [result, serializeCSSVar(cssVars, themeKey, {
    scope: config?.scope,
    hashCls,
    hashPriority
  })];
};