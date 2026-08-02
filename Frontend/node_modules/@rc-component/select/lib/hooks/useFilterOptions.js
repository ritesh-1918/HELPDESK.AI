"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _commonUtil = require("../utils/commonUtil");
var _valueUtil = require("../utils/valueUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function includes(test, search) {
  return (0, _commonUtil.toArray)(test).join('').toUpperCase().includes(search);
}
var _default = (options, fieldNames, searchValue, filterOption, optionFilterProp) => {
  return React.useMemo(() => {
    if (!searchValue || filterOption === false) {
      return options;
    }
    const {
      options: fieldOptions,
      label: fieldLabel,
      value: fieldValue
    } = fieldNames;
    const filteredOptions = [];
    const customizeFilter = typeof filterOption === 'function';
    const upperSearch = searchValue.toUpperCase();
    const filterFunc = customizeFilter ? filterOption : (_, option) => {
      // Use provided `optionFilterProp`
      if (optionFilterProp && optionFilterProp.length) {
        return optionFilterProp.some(prop => includes(option[prop], upperSearch));
      }

      // Auto select `label` or `value` by option type
      if (option[fieldOptions]) {
        // hack `fieldLabel` since `OptionGroup` children is not `label`
        return includes(option[fieldLabel !== 'children' ? fieldLabel : 'label'], upperSearch);
      }
      return includes(option[fieldValue], upperSearch);
    };
    const wrapOption = customizeFilter ? opt => (0, _valueUtil.injectPropsWithOption)(opt) : opt => opt;
    options.forEach(item => {
      // Group should check child options
      if (item[fieldOptions]) {
        // Check group first
        const matchGroup = filterFunc(searchValue, wrapOption(item));
        if (matchGroup) {
          filteredOptions.push(item);
        } else {
          // Check option
          const subOptions = item[fieldOptions].filter(subItem => filterFunc(searchValue, wrapOption(subItem)));
          if (subOptions.length) {
            filteredOptions.push({
              ...item,
              [fieldOptions]: subOptions
            });
          }
        }
        return;
      }
      if (filterFunc(searchValue, wrapOption(item))) {
        filteredOptions.push(item);
      }
    });
    return filteredOptions;
  }, [options, filterOption, optionFilterProp, searchValue, fieldNames]);
};
exports.default = _default;