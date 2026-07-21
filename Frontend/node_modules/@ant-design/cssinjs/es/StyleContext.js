import useMemo from "@rc-component/util/es/hooks/useMemo";
import isEqual from "@rc-component/util/es/isEqual";
import * as React from 'react';
import CacheEntity from "./Cache";
import { AUTO_PREFIX } from "./transformers/autoPrefix";
export const ATTR_TOKEN = 'data-token-hash';
export const ATTR_MARK = 'data-css-hash';
export const ATTR_CACHE_PATH = 'data-cache-path';

// Mark css-in-js instance in style element
export const CSS_IN_JS_INSTANCE = '__cssinjs_instance__';
export function createCache() {
  const cssinjsInstanceId = Math.random().toString(12).slice(2);

  // Tricky SSR: Move all inline style to the head.
  // PS: We do not recommend tricky mode.
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || [];
    const {
      firstChild
    } = document.head;
    Array.from(styles).forEach(style => {
      style[CSS_IN_JS_INSTANCE] ||= cssinjsInstanceId;

      // Not force move if no head
      if (style[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
        document.head.insertBefore(style, firstChild);
      }
    });

    // Deduplicate of moved styles
    const styleHash = {};
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach(style => {
      const hash = style.getAttribute(ATTR_MARK);
      if (styleHash[hash]) {
        if (style[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
          style.parentNode?.removeChild(style);
        }
      } else {
        styleHash[hash] = true;
      }
    });
  }
  return new CacheEntity(cssinjsInstanceId);
}
const StyleContext = /*#__PURE__*/React.createContext({
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
  autoPrefix: false
});
export const StyleProvider = props => {
  const {
    children,
    ...restProps
  } = props;
  const parentContext = React.useContext(StyleContext);
  const context = useMemo(() => {
    const mergedContext = {
      ...parentContext
    };
    Object.keys(restProps).forEach(key => {
      const value = restProps[key];
      if (restProps[key] !== undefined) {
        mergedContext[key] = value;
      }
    });
    const {
      cache,
      transformers = []
    } = restProps;
    mergedContext.cache = mergedContext.cache || createCache();
    mergedContext.defaultCache = !cache && parentContext.defaultCache;

    // autoPrefix
    if (transformers.includes(AUTO_PREFIX)) {
      mergedContext.autoPrefix = true;
    }
    return mergedContext;
  }, [parentContext, restProps], (prev, next) => !isEqual(prev[0], next[0], true) || !isEqual(prev[1], next[1], true));
  return /*#__PURE__*/React.createElement(StyleContext.Provider, {
    value: context
  }, children);
};
export default StyleContext;