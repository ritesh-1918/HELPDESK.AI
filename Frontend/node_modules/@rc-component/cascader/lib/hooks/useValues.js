"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useValues;
var _conductUtil = require("@rc-component/tree/lib/utils/conductUtil");
var React = _interopRequireWildcard(require("react"));
var _commonUtil = require("../utils/commonUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useValues(multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues) {
  // Fill `rawValues` with checked conduction values
  return React.useMemo(() => {
    const [existValues, missingValues] = getMissingValues(rawValues);
    if (!multiple || !rawValues.length) {
      return [existValues, [], missingValues];
    }
    const keyPathValues = (0, _commonUtil.toPathKeys)(existValues);
    const keyPathEntities = getPathKeyEntities();
    const {
      checkedKeys,
      halfCheckedKeys
    } = (0, _conductUtil.conductCheck)(keyPathValues, true, keyPathEntities);

    // Convert key back to value cells
    return [getValueByKeyPath(checkedKeys), getValueByKeyPath(halfCheckedKeys), missingValues];
  }, [multiple, rawValues, getPathKeyEntities, getValueByKeyPath, getMissingValues]);
}