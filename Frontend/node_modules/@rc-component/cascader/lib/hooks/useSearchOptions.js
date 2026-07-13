"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SEARCH_MARK = void 0;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const SEARCH_MARK = exports.SEARCH_MARK = '__rc_cascader_search_mark__';
const defaultFilter = (search, options, {
  label = ''
}) => options.some(opt => String(opt[label]).toLowerCase().includes(search.toLowerCase()));
const defaultRender = (inputValue, path, prefixCls, fieldNames) => path.map(opt => opt[fieldNames.label]).join(' / ');
const useSearchOptions = (search, options, fieldNames, prefixCls, config, enableHalfPath) => {
  const {
    filter = defaultFilter,
    render = defaultRender,
    limit = 50,
    sort
  } = config;
  return React.useMemo(() => {
    const filteredOptions = [];
    if (!search) {
      return [];
    }
    function dig(list, pathOptions, parentDisabled = false) {
      list.forEach(option => {
        // Perf saving when `sort` is disabled and `limit` is provided
        if (!sort && limit !== false && limit > 0 && filteredOptions.length >= limit) {
          return;
        }
        const connectedPathOptions = [...pathOptions, option];
        const children = option[fieldNames.children];
        const mergedDisabled = parentDisabled || option.disabled;

        // If current option is filterable
        if (
        // If is leaf option
        !children || children.length === 0 ||
        // If is changeOnSelect or multiple
        enableHalfPath) {
          if (filter(search, connectedPathOptions, {
            label: fieldNames.label
          })) {
            filteredOptions.push({
              ...option,
              disabled: mergedDisabled,
              [fieldNames.label]: render(search, connectedPathOptions, prefixCls, fieldNames),
              [SEARCH_MARK]: connectedPathOptions,
              [fieldNames.children]: undefined
            });
          }
        }
        if (children) {
          dig(option[fieldNames.children], connectedPathOptions, mergedDisabled);
        }
      });
    }
    dig(options, []);

    // Do sort
    if (sort) {
      filteredOptions.sort((a, b) => {
        return sort(a[SEARCH_MARK], b[SEARCH_MARK], search, fieldNames);
      });
    }
    return limit !== false && limit > 0 ? filteredOptions.slice(0, limit) : filteredOptions;
  }, [search, options, fieldNames, prefixCls, render, enableHalfPath, filter, sort, limit]);
};
var _default = exports.default = useSearchOptions;