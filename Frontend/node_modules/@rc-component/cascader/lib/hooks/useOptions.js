"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useOptions;
var React = _interopRequireWildcard(require("react"));
var _useEntities = _interopRequireDefault(require("./useEntities"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useOptions(mergedFieldNames, options) {
  const mergedOptions = React.useMemo(() => options || [], [options]);

  // Only used in multiple mode, this fn will not call in single mode
  const getPathKeyEntities = (0, _useEntities.default)(mergedOptions, mergedFieldNames);

  /** Convert path key back to value format */
  const getValueByKeyPath = React.useCallback(pathKeys => {
    const keyPathEntities = getPathKeyEntities();
    return pathKeys.map(pathKey => {
      const {
        nodes
      } = keyPathEntities[pathKey];
      return nodes.map(node => node[mergedFieldNames.value]);
    });
  }, [getPathKeyEntities, mergedFieldNames]);
  return [mergedOptions, getPathKeyEntities, getValueByKeyPath];
}