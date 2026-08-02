"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _legacyUtil = require("../utils/legacyUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Parse `children` to `options` if `options` is not provided.
 * Then flatten the `options`.
 */
const useOptions = (options, children, fieldNames, optionFilterProp, optionLabelProp) => {
  return React.useMemo(() => {
    let mergedOptions = options;
    const childrenAsData = !options;
    if (childrenAsData) {
      mergedOptions = (0, _legacyUtil.convertChildrenToData)(children);
    }
    const valueOptions = new Map();
    const labelOptions = new Map();
    const setLabelOptions = (labelOptionsMap, option, key) => {
      if (key && typeof key === 'string') {
        labelOptionsMap.set(option[key], option);
      }
    };
    const dig = (optionList, isChildren = false) => {
      // for loop to speed up collection speed
      for (let i = 0; i < optionList.length; i += 1) {
        const option = optionList[i];
        if (!option[fieldNames.options] || isChildren) {
          valueOptions.set(option[fieldNames.value], option);
          setLabelOptions(labelOptions, option, fieldNames.label);
          // https://github.com/ant-design/ant-design/issues/35304
          optionFilterProp.forEach(prop => {
            setLabelOptions(labelOptions, option, prop);
          });
          setLabelOptions(labelOptions, option, optionLabelProp);
        } else {
          dig(option[fieldNames.options], true);
        }
      }
    };
    dig(mergedOptions);
    return {
      options: mergedOptions,
      valueOptions,
      labelOptions
    };
  }, [options, children, fieldNames, optionFilterProp, optionLabelProp]);
};
var _default = exports.default = useOptions;