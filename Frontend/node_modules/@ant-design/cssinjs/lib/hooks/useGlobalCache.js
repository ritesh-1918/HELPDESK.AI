"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useGlobalCache;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _Cache = require("../Cache");
var _StyleContext = _interopRequireDefault(require("../StyleContext"));
var _useHMR = _interopRequireDefault(require("./useHMR"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const effectMap = new Map();
function useGlobalCache(prefix, keyPath, cacheFn, onCacheRemove,
// Add additional effect trigger by `useInsertionEffect`
onCacheEffect) {
  const {
    cache: globalCache
  } = React.useContext(_StyleContext.default);
  const fullPath = [prefix, ...keyPath];
  const fullPathStr = (0, _Cache.pathKey)(fullPath);
  const HMRUpdate = (0, _useHMR.default)();
  const buildCache = updater => {
    globalCache.opUpdate(fullPathStr, prevCache => {
      const [times = 0, cache] = prevCache || [undefined, undefined];

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache;
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate);
        tmpCache = null;
      }
      const mergedCache = tmpCache || cacheFn();
      const data = [times, mergedCache];

      // Call updater if need additional logic
      return updater ? updater(data) : data;
    });
  };

  // Create cache
  React.useMemo(() => {
    buildCache();
  }, /* eslint-disable react-hooks/exhaustive-deps */
  [fullPathStr]
  /* eslint-enable */);
  let cacheEntity = globalCache.opGet(fullPathStr);

  // HMR clean the cache but not trigger `useMemo` again
  // Let's fallback of this
  // ref https://github.com/ant-design/cssinjs/issues/127
  if (process.env.NODE_ENV !== 'production' && !cacheEntity) {
    buildCache();
    cacheEntity = globalCache.opGet(fullPathStr);
  }
  const cacheContent = cacheEntity[1];

  // Remove if no need anymore
  (0, _react.useInsertionEffect)(() => {
    buildCache(([times, cache]) => [times + 1, cache]);
    if (!effectMap.has(fullPathStr)) {
      onCacheEffect?.(cacheContent);
      effectMap.set(fullPathStr, true);

      // 微任务清理缓存，可以认为是单次 batch render 中只触发一次 effect
      Promise.resolve().then(() => {
        effectMap.delete(fullPathStr);
      });
    }
    return () => {
      globalCache.opUpdate(fullPathStr, prevCache => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;
        if (nextCount === 0) {
          onCacheRemove?.(cache, false);
          effectMap.delete(fullPathStr);
          return null;
        }
        return [times - 1, cache];
      });
    };
  }, [fullPathStr]);
  return cacheContent;
}