"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CarOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CarOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CarOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CarOutlined.default
}));

/**![car](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM4MCA3MDRoMjY0YzQuNCAwIDgtMy42IDgtOHYtODRjMC00LjQtMy42LTgtOC04aC00MGMtNC40IDAtOCAzLjYtOCA4djM2SDQyOHYtMzZjMC00LjQtMy42LTgtOC04aC00MGMtNC40IDAtOCAzLjYtOCA4djg0YzAgNC40IDMuNiA4IDggOHptMzQwLTEyM2E0MCA0MCAwIDEwODAgMCA0MCA0MCAwIDEwLTgwIDB6bTIzOS0xNjcuNkw5MzUuMyAzNzJhOCA4IDAgMDAtMTAuOS0yLjlsLTUwLjcgMjkuNi03OC4zLTIxNi4yYTYzLjkgNjMuOSAwIDAwLTYwLjktNDQuNEgzMDEuMmMtMzQuNyAwLTY1LjUgMjIuNC03Ni4yIDU1LjVsLTc0LjYgMjA1LjItNTAuOC0yOS42YTggOCAwIDAwLTEwLjkgMi45TDY1IDQxMy40Yy0yLjIgMy44LS45IDguNiAyLjkgMTAuOGw2MC40IDM1LjItMTQuNSA0MGMtMS4yIDMuMi0xLjggNi42LTEuOCAxMHYzNDguMmMwIDE1LjcgMTEuOCAyOC40IDI2LjMgMjguNGg2Ny42YzEyLjMgMCAyMy05LjMgMjUuNi0yMi4zbDcuNy0zNy43aDU0NS42bDcuNyAzNy43YzIuNyAxMyAxMy4zIDIyLjMgMjUuNiAyMi4zaDY3LjZjMTQuNSAwIDI2LjMtMTIuNyAyNi4zLTI4LjRWNTA5LjRjMC0zLjQtLjYtNi44LTEuOC0xMGwtMTQuNS00MCA2MC4zLTM1LjJhOCA4IDAgMDAzLTEwLjh6TTg0MCA1MTd2MjM3SDE4NFY1MTdsMTUuNi00M2g2MjQuOGwxNS42IDQzek0yOTIuNyAyMTguMWwuNS0xLjMuNC0xLjNjMS4xLTMuMyA0LjEtNS41IDcuNi01LjVoNDI3LjZsNzUuNCAyMDhIMjIwbDcyLjctMTk5Ljl6TTIyNCA1ODFhNDAgNDAgMCAxMDgwIDAgNDAgNDAgMCAxMC04MCAweiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CarOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CarOutlined';
}
var _default = exports.default = RefIcon;