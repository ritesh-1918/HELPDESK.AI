"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PercentageOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PercentageOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PercentageOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PercentageOutlined.default
}));

/**![percentage](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NS43IDIxMC44bC00Mi40LTQyLjRhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDE2OC4zIDgwMS45YTguMDMgOC4wMyAwIDAwMCAxMS4zbDQyLjQgNDIuNGMzLjEgMy4xIDguMiAzLjEgMTEuMyAwTDg1NS42IDIyMmMzLjItMyAzLjItOC4xLjEtMTEuMnpNMzA0IDQ0OGM3OS40IDAgMTQ0LTY0LjYgMTQ0LTE0NHMtNjQuNi0xNDQtMTQ0LTE0NC0xNDQgNjQuNi0xNDQgMTQ0IDY0LjYgMTQ0IDE0NCAxNDR6bTAtMjE2YzM5LjcgMCA3MiAzMi4zIDcyIDcycy0zMi4zIDcyLTcyIDcyLTcyLTMyLjMtNzItNzIgMzIuMy03MiA3Mi03MnptNDE2IDM0NGMtNzkuNCAwLTE0NCA2NC42LTE0NCAxNDRzNjQuNiAxNDQgMTQ0IDE0NCAxNDQtNjQuNiAxNDQtMTQ0LTY0LjYtMTQ0LTE0NC0xNDR6bTAgMjE2Yy0zOS43IDAtNzItMzIuMy03Mi03MnMzMi4zLTcyIDcyLTcyIDcyIDMyLjMgNzIgNzItMzIuMyA3Mi03MiA3MnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PercentageOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PercentageOutlined';
}
var _default = exports.default = RefIcon;