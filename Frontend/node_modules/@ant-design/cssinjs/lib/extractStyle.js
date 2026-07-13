"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extractStyle;
var _useCacheToken = require("./hooks/useCacheToken");
var _useCSSVarRegister = require("./hooks/useCSSVarRegister");
var _useStyleRegister = require("./hooks/useStyleRegister");
var _util = require("./util");
var _cacheMapUtil = require("./util/cacheMapUtil");
const ExtractStyleFns = {
  [_useStyleRegister.STYLE_PREFIX]: _useStyleRegister.extract,
  [_useCacheToken.TOKEN_PREFIX]: _useCacheToken.extract,
  [_useCSSVarRegister.CSS_VAR_PREFIX]: _useCSSVarRegister.extract
};
function isNotNull(value) {
  return value !== null;
}
function extractStyle(cache, options) {
  const {
    plain = false,
    types = ['style', 'token', 'cssVar'],
    once = false
  } = typeof options === 'boolean' ? {
    plain: options
  } : options || {};
  const matchPrefixRegexp = new RegExp(`^(${(typeof types === 'string' ? [types] : types).join('|')})%`);

  // prefix with `style` is used for `useStyleRegister` to cache style context
  const styleKeys = Array.from(cache.cache.keys()).filter(key => matchPrefixRegexp.test(key));

  // Common effect styles like animation
  const effectStyles = {};

  // Mapping of cachePath to style hash
  const cachePathMap = {};
  let styleText = '';
  styleKeys.map(key => {
    if (once && cache.extracted.has(key)) {
      return null; // Skip if already extracted
    }
    const cachePath = key.replace(matchPrefixRegexp, '').replace(/%/g, '|');
    const [prefix] = key.split('%');
    const extractFn = ExtractStyleFns[prefix];
    const extractedStyle = extractFn(cache.cache.get(key)[1], effectStyles, {
      plain
    });
    if (!extractedStyle) {
      return null;
    }
    const updateTime = cache.updateTimes.get(key) || 0;
    const [order, styleId, styleStr] = extractedStyle;
    if (key.startsWith('style')) {
      cachePathMap[cachePath] = styleId;
    }

    // record that this style has been extracted
    cache.extracted.add(key);
    return [order, styleStr, updateTime];
  }).filter(isNotNull).sort(([o1,, u1], [o2,, u2]) => {
    if (o1 !== o2) {
      return o1 - o2;
    }
    return u1 - u2;
  }).forEach(([, style]) => {
    styleText += style;
  });

  // ==================== Fill Cache Path ====================
  styleText += (0, _util.toStyleStr)(`.${_cacheMapUtil.ATTR_CACHE_MAP}{content:"${(0, _cacheMapUtil.serialize)(cachePathMap)}";}`, undefined, undefined, {
    [_cacheMapUtil.ATTR_CACHE_MAP]: _cacheMapUtil.ATTR_CACHE_MAP
  }, plain);
  return styleText;
}