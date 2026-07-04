"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IdcardTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IdcardTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IdcardTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IdcardTwoTone.default
}));

/**![idcard](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAxNjBIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY0MGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTkyYzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjMySDEzNlYyMzJoNzUydjU2MHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTEzNiA3OTJoNzUyVjIzMkgxMzZ2NTYwem00NzItMzcyYzAtNC40IDEtOCAyLjMtOGgxMjMuNGMxLjMgMCAyLjMgMy42IDIuMyA4djQ4YzAgNC40LTEgOC0yLjMgOEg2MTAuM2MtMS4zIDAtMi4zLTMuNi0yLjMtOHYtNDh6bTAgMTQ0YzAtNC40IDMuMi04IDcuMS04aDE4NS43YzMuOSAwIDcuMSAzLjYgNy4xIDh2NDhjMCA0LjQtMy4yIDgtNy4xIDhINjE1LjFjLTMuOSAwLTcuMS0zLjYtNy4xLTh2LTQ4ek0yMTYuMiA2NjQuNmMyLjgtNTMuMyAzMS45LTk5LjYgNzQuNi0xMjYuMS0xOC4xLTIwLTI5LjEtNDYuNC0yOS4xLTc1LjUgMC02MS45IDQ5LjktMTEyIDExMS40LTExMnMxMTEuNCA1MC4xIDExMS40IDExMmMwIDI5LjEtMTEgNTUuNi0yOS4xIDc1LjUgNDIuNiAyNi40IDcxLjggNzIuOCA3NC42IDEyNi4xYTggOCAwIDAxLTggOC40aC00My45Yy00LjIgMC03LjYtMy4zLTcuOS03LjUtMy44LTUwLjUtNDYtOTAuNS05Ny4yLTkwLjVzLTkzLjQgNDAtOTcuMiA5MC41Yy0uMyA0LjItMy43IDcuNS03LjkgNy41SDIyNGMtNC42IDAtOC4yLTMuOC03LjgtOC40eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNMzIxLjMgNDYzYTUxLjcgNTIgMCAxMDEwMy40IDAgNTEuNyA1MiAwIDEwLTEwMy40IDB6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik02MTAuMyA0NzZoMTIzLjRjMS4zIDAgMi4zLTMuNiAyLjMtOHYtNDhjMC00LjQtMS04LTIuMy04SDYxMC4zYy0xLjMgMC0yLjMgMy42LTIuMyA4djQ4YzAgNC40IDEgOCAyLjMgOHptNC44IDE0NGgxODUuN2MzLjkgMCA3LjEtMy42IDcuMS04di00OGMwLTQuNC0zLjItOC03LjEtOEg2MTUuMWMtMy45IDAtNy4xIDMuNi03LjEgOHY0OGMwIDQuNCAzLjIgOCA3LjEgOHpNMjI0IDY3M2g0My45YzQuMiAwIDcuNi0zLjMgNy45LTcuNSAzLjgtNTAuNSA0Ni05MC41IDk3LjItOTAuNXM5My40IDQwIDk3LjIgOTAuNWMuMyA0LjIgMy43IDcuNSA3LjkgNy41SDUyMmE4IDggMCAwMDgtOC40Yy0yLjgtNTMuMy0zMi05OS43LTc0LjYtMTI2LjFhMTExLjggMTExLjggMCAwMDI5LjEtNzUuNWMwLTYxLjktNDkuOS0xMTItMTExLjQtMTEycy0xMTEuNCA1MC4xLTExMS40IDExMmMwIDI5LjEgMTEgNTUuNSAyOS4xIDc1LjVhMTU4LjA5IDE1OC4wOSAwIDAwLTc0LjYgMTI2LjFjLS40IDQuNiAzLjIgOC40IDcuOCA4LjR6bTE0OS0yNjJjMjguNSAwIDUxLjcgMjMuMyA1MS43IDUycy0yMy4yIDUyLTUxLjcgNTItNTEuNy0yMy4zLTUxLjctNTIgMjMuMi01MiA1MS43LTUyeiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(IdcardTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IdcardTwoTone';
}
var _default = exports.default = RefIcon;