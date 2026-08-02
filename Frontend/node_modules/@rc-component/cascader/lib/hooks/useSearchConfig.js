"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useSearchConfig;
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Convert `showSearch` to unique config
function useSearchConfig(showSearch, props) {
  const {
    autoClearSearchValue,
    searchValue,
    onSearch
  } = props;
  return React.useMemo(() => {
    if (!showSearch) {
      return [false, {}];
    }
    let searchConfig = {
      matchInputWidth: true,
      limit: 50,
      autoClearSearchValue,
      searchValue,
      onSearch
    };
    if (showSearch && typeof showSearch === 'object') {
      searchConfig = {
        ...searchConfig,
        ...showSearch
      };
    }
    if (searchConfig.limit <= 0) {
      searchConfig.limit = false;
      if (process.env.NODE_ENV !== 'production') {
        (0, _warning.default)(false, "'limit' of showSearch should be positive number or false.");
      }
    }
    return [true, searchConfig];
  }, [showSearch, autoClearSearchValue, searchValue, onSearch]);
}