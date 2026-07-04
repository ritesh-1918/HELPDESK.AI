"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StyleProvider = exports.CSS_IN_JS_INSTANCE = exports.ATTR_TOKEN = exports.ATTR_MARK = exports.ATTR_CACHE_PATH = void 0;
exports.createCache = createCache;
exports.default = void 0;
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var React = _interopRequireWildcard(require("react"));
var _Cache = _interopRequireDefault(require("./Cache"));
var _autoPrefix = require("./transformers/autoPrefix");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ATTR_TOKEN = exports.ATTR_TOKEN = 'data-token-hash';
const ATTR_MARK = exports.ATTR_MARK = 'data-css-hash';
const ATTR_CACHE_PATH = exports.ATTR_CACHE_PATH = 'data-cache-path';

// Mark css-in-js instance in style element
const CSS_IN_JS_INSTANCE = exports.CSS_IN_JS_INSTANCE = '__cssinjs_instance__';
function createCache() {
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
  return new _Cache.default(cssinjsInstanceId);
}
const StyleContext = /*#__PURE__*/React.createContext({
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
  autoPrefix: false
});
const StyleProvider = props => {
  const {
    children,
    ...restProps
  } = props;
  const parentContext = React.useContext(StyleContext);
  const context = (0, _useMemo.default)(() => {
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
    if (transformers.includes(_autoPrefix.AUTO_PREFIX)) {
      mergedContext.autoPrefix = true;
    }
    return mergedContext;
  }, [parentContext, restProps], (prev, next) => !(0, _isEqual.default)(prev[0], next[0], true) || !(0, _isEqual.default)(prev[1], next[1], true));
  return /*#__PURE__*/React.createElement(StyleContext.Provider, {
    value: context
  }, children);
};
exports.StyleProvider = StyleProvider;
var _default = exports.default = StyleContext;