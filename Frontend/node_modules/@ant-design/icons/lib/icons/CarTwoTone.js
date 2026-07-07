"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CarTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CarTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CarTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CarTwoTone.default
}));

/**![car](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE5OS42IDQ3NEwxODQgNTE3djIzN2g2NTZWNTE3bC0xNS42LTQzSDE5OS42ek0yNjQgNjIxYy0yMi4xIDAtNDAtMTcuOS00MC00MHMxNy45LTQwIDQwLTQwIDQwIDE3LjkgNDAgNDAtMTcuOSA0MC00MCA0MHptMzg4IDc1YzAgNC40LTMuNiA4LTggOEgzODBjLTQuNCAwLTgtMy42LTgtOHYtODRjMC00LjQgMy42LTggOC04aDQwYzQuNCAwIDggMy42IDggOHYzNmgxNjh2LTM2YzAtNC40IDMuNi04IDgtOGg0MGM0LjQgMCA4IDMuNiA4IDh2ODR6bTEwOC03NWMtMjIuMSAwLTQwLTE3LjktNDAtNDBzMTcuOS00MCA0MC00MCA0MCAxNy45IDQwIDQwLTE3LjkgNDAtNDAgNDB6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik03MjAgNTgxYTQwIDQwIDAgMTA4MCAwIDQwIDQwIDAgMTAtODAgMHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTk1OSA0MTMuNEw5MzUuMyAzNzJhOCA4IDAgMDAtMTAuOS0yLjlsLTUwLjcgMjkuNi03OC4zLTIxNi4yYTYzLjkgNjMuOSAwIDAwLTYwLjktNDQuNEgzMDEuMmMtMzQuNyAwLTY1LjUgMjIuNC03Ni4yIDU1LjVsLTc0LjYgMjA1LjItNTAuOC0yOS42YTggOCAwIDAwLTEwLjkgMi45TDY1IDQxMy40Yy0yLjIgMy44LS45IDguNiAyLjkgMTAuOGw2MC40IDM1LjItMTQuNSA0MGMtMS4yIDMuMi0xLjggNi42LTEuOCAxMHYzNDguMmMwIDE1LjcgMTEuOCAyOC40IDI2LjMgMjguNGg2Ny42YzEyLjMgMCAyMy05LjMgMjUuNi0yMi4zbDcuNy0zNy43aDU0NS42bDcuNyAzNy43YzIuNyAxMyAxMy4zIDIyLjMgMjUuNiAyMi4zaDY3LjZjMTQuNSAwIDI2LjMtMTIuNyAyNi4zLTI4LjRWNTA5LjRjMC0zLjQtLjYtNi44LTEuOC0xMGwtMTQuNS00MCA2MC4zLTM1LjJhOCA4IDAgMDAzLTEwLjh6TTI5Mi43IDIxOC4xbC41LTEuMy40LTEuM2MxLjEtMy4zIDQuMS01LjUgNy42LTUuNWg0MjcuNmw3NS40IDIwOEgyMjBsNzIuNy0xOTkuOXpNODQwIDc1NEgxODRWNTE3bDE1LjYtNDNoNjI0LjhsMTUuNiA0M3YyMzd6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik0yMjQgNTgxYTQwIDQwIDAgMTA4MCAwIDQwIDQwIDAgMTAtODAgMHptNDIwIDIzaC00MGMtNC40IDAtOCAzLjYtOCA4djM2SDQyOHYtMzZjMC00LjQtMy42LTgtOC04aC00MGMtNC40IDAtOCAzLjYtOCA4djg0YzAgNC40IDMuNiA4IDggOGgyNjRjNC40IDAgOC0zLjYgOC04di04NGMwLTQuNC0zLjYtOC04LTh6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CarTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CarTwoTone';
}
var _default = exports.default = RefIcon;