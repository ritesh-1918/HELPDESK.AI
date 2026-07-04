"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _treeUtil = require("../utils/treeUtil");
var React = _interopRequireWildcard(require("react"));
var _commonUtil = require("../utils/commonUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = (rawValues, options, fieldNames, multiple, displayRender) => {
  return React.useMemo(() => {
    const mergedDisplayRender = displayRender || (
    // Default displayRender
    labels => {
      const mergedLabels = multiple ? labels.slice(-1) : labels;
      const SPLIT = ' / ';
      if (mergedLabels.every(label => ['string', 'number'].includes(typeof label))) {
        return mergedLabels.join(SPLIT);
      }

      // If exist non-string value, use ReactNode instead
      return mergedLabels.reduce((list, label, index) => {
        const keyedLabel = /*#__PURE__*/React.isValidElement(label) ? /*#__PURE__*/React.cloneElement(label, {
          key: index
        }) : label;
        if (index === 0) {
          return [keyedLabel];
        }
        return [...list, SPLIT, keyedLabel];
      }, []);
    });
    return rawValues.map(valueCells => {
      const valueOptions = (0, _treeUtil.toPathOptions)(valueCells, options, fieldNames);
      const label = mergedDisplayRender(valueOptions.map(({
        option,
        value
      }) => option?.[fieldNames.label] ?? value), valueOptions.map(({
        option
      }) => option));
      const value = (0, _commonUtil.toPathKey)(valueCells);
      return {
        label,
        value,
        key: value,
        valueCells,
        disabled: valueOptions[valueOptions.length - 1]?.option?.disabled
      };
    });
  }, [rawValues, options, fieldNames, displayRender, multiple]);
};
exports.default = _default;