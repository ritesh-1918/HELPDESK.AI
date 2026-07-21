"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _conductUtil = require("@rc-component/tree/lib/utils/conductUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const useCheckedKeys = (rawLabeledValues, rawHalfCheckedValues, treeConduction, keyEntities) => {
  return React.useMemo(() => {
    const extractValues = values => values.map(({
      value
    }) => value);
    const checkedKeys = extractValues(rawLabeledValues);
    const halfCheckedKeys = extractValues(rawHalfCheckedValues);
    const missingValues = checkedKeys.filter(key => !keyEntities[key]);
    let finalCheckedKeys = checkedKeys;
    let finalHalfCheckedKeys = halfCheckedKeys;
    if (treeConduction) {
      const conductResult = (0, _conductUtil.conductCheck)(checkedKeys, true, keyEntities);
      finalCheckedKeys = conductResult.checkedKeys;
      finalHalfCheckedKeys = conductResult.halfCheckedKeys;
    }
    return [Array.from(new Set([...missingValues, ...finalCheckedKeys])), finalHalfCheckedKeys];
  }, [rawLabeledValues, rawHalfCheckedValues, treeConduction, keyEntities]);
};
var _default = exports.default = useCheckedKeys;