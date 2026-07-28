"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Cache `value` related LabeledValue & options.
 */
var _default = (labeledValues, valueOptions) => {
  const cacheRef = React.useRef({
    values: new Map(),
    options: new Map()
  });
  const filledLabeledValues = React.useMemo(() => {
    const {
      values: prevValueCache,
      options: prevOptionCache
    } = cacheRef.current;

    // Fill label by cache
    const patchedValues = labeledValues.map(item => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.get(item.value)?.label
        };
      }
      return item;
    });

    // Refresh cache
    const valueCache = new Map();
    const optionCache = new Map();
    patchedValues.forEach(item => {
      valueCache.set(item.value, item);
      optionCache.set(item.value, valueOptions.get(item.value) || prevOptionCache.get(item.value));
    });
    cacheRef.current.values = valueCache;
    cacheRef.current.options = optionCache;
    return patchedValues;
  }, [labeledValues, valueOptions]);
  const getOption = React.useCallback(val => valueOptions.get(val) || cacheRef.current.options.get(val), [valueOptions]);
  return [filledLabeledValues, getOption];
};
exports.default = _default;