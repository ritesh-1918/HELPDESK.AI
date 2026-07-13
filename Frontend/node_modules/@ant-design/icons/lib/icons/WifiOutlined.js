"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _WifiOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/WifiOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const WifiOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _WifiOutlined.default
}));

/**![wifi](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcyMyA2MjAuNUM2NjYuOCA1NzEuNiA1OTMuNCA1NDIgNTEzIDU0MnMtMTUzLjggMjkuNi0yMTAuMSA3OC42YTguMSA4LjEgMCAwMC0uOCAxMS4ybDM2IDQyLjljMi45IDMuNCA4IDMuOCAxMS40LjlDMzkzLjEgNjM3LjIgNDUwLjMgNjE0IDUxMyA2MTRzMTE5LjkgMjMuMiAxNjMuNSA2MS41YzMuNCAyLjkgOC41IDIuNSAxMS40LS45bDM2LTQyLjljMi44LTMuMyAyLjQtOC4zLS45LTExLjJ6bTExNy40LTE0MC4xQzc1MS43IDQwNi41IDYzNy42IDM2MiA1MTMgMzYycy0yMzguNyA0NC41LTMyNy41IDExOC40YTguMDUgOC4wNSAwIDAwLTEgMTEuM2wzNiA0Mi45YzIuOCAzLjQgNy45IDMuOCAxMS4yIDFDMzA4IDQ3Mi4yIDQwNi4xIDQzNCA1MTMgNDM0czIwNSAzOC4yIDI4MS4yIDEwMS42YzMuNCAyLjggOC40IDIuNCAxMS4yLTFsMzYtNDIuOWMyLjgtMy40IDIuNC04LjUtMS0xMS4zem0xMTYuNy0xMzlDODM1LjcgMjQxLjggNjgwLjMgMTgyIDUxMSAxODJjLTE2OC4yIDAtMzIyLjYgNTktNDQzLjcgMTU3LjRhOCA4IDAgMDAtMS4xIDExLjRsMzYgNDIuOWMyLjggMy4zIDcuOCAzLjggMTEuMSAxLjFDMjIyIDMwNi43IDM2MC4zIDI1NCA1MTEgMjU0YzE1MS44IDAgMjkxIDUzLjUgNDAwIDE0Mi43IDMuNCAyLjggOC40IDIuMyAxMS4yLTEuMWwzNi00Mi45YzIuOS0zLjQgMi40LTguNS0xLjEtMTEuM3pNNDQ4IDc3OGE2NCA2NCAwIDEwMTI4IDAgNjQgNjQgMCAxMC0xMjggMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(WifiOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'WifiOutlined';
}
var _default = exports.default = RefIcon;