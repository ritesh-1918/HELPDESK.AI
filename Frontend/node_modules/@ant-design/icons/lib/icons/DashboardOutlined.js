"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DashboardOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DashboardOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DashboardOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DashboardOutlined.default
}));

/**![dashboard](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNC44IDM4NS42YTQ0Ni43IDQ0Ni43IDAgMDAtOTYtMTQyLjQgNDQ2LjcgNDQ2LjcgMCAwMC0xNDIuNC05NkM2MzEuMSAxMjMuOCA1NzIuNSAxMTIgNTEyIDExMnMtMTE5LjEgMTEuOC0xNzQuNCAzNS4yYTQ0Ni43IDQ0Ni43IDAgMDAtMTQyLjQgOTYgNDQ2LjcgNDQ2LjcgMCAwMC05NiAxNDIuNEM3NS44IDQ0MC45IDY0IDQ5OS41IDY0IDU2MGMwIDEzMi43IDU4LjMgMjU3LjcgMTU5LjkgMzQzLjFsMS43IDEuNGM1LjggNC44IDEzLjEgNy41IDIwLjYgNy41aDUzMS43YzcuNSAwIDE0LjgtMi43IDIwLjYtNy41bDEuNy0xLjRDOTAxLjcgODE3LjcgOTYwIDY5Mi43IDk2MCA1NjBjMC02MC41LTExLjktMTE5LjEtMzUuMi0xNzQuNHpNNzYxLjQgODM2SDI2Mi42QTM3MS4xMiAzNzEuMTIgMCAwMTE0MCA1NjBjMC05OS40IDM4LjctMTkyLjggMTA5LTI2MyA3MC4zLTcwLjMgMTYzLjctMTA5IDI2My0xMDkgOTkuNCAwIDE5Mi44IDM4LjcgMjYzIDEwOSA3MC4zIDcwLjMgMTA5IDE2My43IDEwOSAyNjMgMCAxMDUuNi00NC41IDIwNS41LTEyMi42IDI3NnpNNjIzLjUgNDIxLjVhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDUyNy43IDUwNmMtMTguNy01LTM5LjQtLjItNTQuMSAxNC41YTU1Ljk1IDU1Ljk1IDAgMDAwIDc5LjIgNTUuOTUgNTUuOTUgMCAwMDc5LjIgMCA1NS44NyA1NS44NyAwIDAwMTQuNS01NC4xbDg0LjUtODQuNWMzLjEtMy4xIDMuMS04LjIgMC0xMS4zbC0yOC4zLTI4LjN6TTQ5MCAzMjBoNDRjNC40IDAgOC0zLjYgOC04di04MGMwLTQuNC0zLjYtOC04LThoLTQ0Yy00LjQgMC04IDMuNi04IDh2ODBjMCA0LjQgMy42IDggOCA4em0yNjAgMjE4djQ0YzAgNC40IDMuNiA4IDggOGg4MGM0LjQgMCA4LTMuNiA4LTh2LTQ0YzAtNC40LTMuNi04LTgtOGgtODBjLTQuNCAwLTggMy42LTggOHptMTIuNy0xOTcuMmwtMzEuMS0zMS4xYTguMDMgOC4wMyAwIDAwLTExLjMgMGwtNTYuNiA1Ni42YTguMDMgOC4wMyAwIDAwMCAxMS4zbDMxLjEgMzEuMWMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDU2LjYtNTYuNmMzLjEtMy4xIDMuMS04LjIgMC0xMS4zem0tNDU4LjYtMzEuMWE4LjAzIDguMDMgMCAwMC0xMS4zIDBsLTMxLjEgMzEuMWE4LjAzIDguMDMgMCAwMDAgMTEuM2w1Ni42IDU2LjZjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGwzMS4xLTMxLjFjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM2wtNTYuNi01Ni42ek0yNjIgNTMwaC04MGMtNC40IDAtOCAzLjYtOCA4djQ0YzAgNC40IDMuNiA4IDggOGg4MGM0LjQgMCA4LTMuNiA4LTh2LTQ0YzAtNC40LTMuNi04LTgtOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DashboardOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DashboardOutlined';
}
var _default = exports.default = RefIcon;