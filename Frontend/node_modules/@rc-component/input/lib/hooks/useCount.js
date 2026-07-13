"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useCount;
exports.inCountRange = inCountRange;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Cut `value` by the `count.max` prop.
 */
function inCountRange(value, countConfig) {
  if (!countConfig.max) {
    return true;
  }
  const count = countConfig.strategy(value);
  return count <= countConfig.max;
}
function useCount(count, showCount) {
  return React.useMemo(() => {
    let mergedConfig = {};
    if (showCount) {
      mergedConfig.show = typeof showCount === 'object' && showCount.formatter ? showCount.formatter : !!showCount;
    }
    mergedConfig = {
      ...mergedConfig,
      ...count
    };
    const {
      show,
      ...rest
    } = mergedConfig;
    return {
      ...rest,
      show: !!show,
      showFormatter: typeof show === 'function' ? show : undefined,
      strategy: rest.strategy || (value => value.length)
    };
  }, [count, showCount]);
}