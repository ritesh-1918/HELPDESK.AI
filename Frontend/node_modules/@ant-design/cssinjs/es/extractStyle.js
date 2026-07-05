import { extract as tokenExtractStyle, TOKEN_PREFIX } from "./hooks/useCacheToken";
import { CSS_VAR_PREFIX, extract as cssVarExtractStyle } from "./hooks/useCSSVarRegister";
import { extract as styleExtractStyle, STYLE_PREFIX } from "./hooks/useStyleRegister";
import { toStyleStr } from "./util";
import { ATTR_CACHE_MAP, serialize as serializeCacheMap } from "./util/cacheMapUtil";
const ExtractStyleFns = {
  [STYLE_PREFIX]: styleExtractStyle,
  [TOKEN_PREFIX]: tokenExtractStyle,
  [CSS_VAR_PREFIX]: cssVarExtractStyle
};
function isNotNull(value) {
  return value !== null;
}
export default function extractStyle(cache, options) {
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
  styleText += toStyleStr(`.${ATTR_CACHE_MAP}{content:"${serializeCacheMap(cachePathMap)}";}`, undefined, undefined, {
    [ATTR_CACHE_MAP]: ATTR_CACHE_MAP
  }, plain);
  return styleText;
}