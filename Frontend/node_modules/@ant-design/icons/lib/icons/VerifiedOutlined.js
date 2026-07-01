"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _VerifiedOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/VerifiedOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const VerifiedOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _VerifiedOutlined.default
}));

/**![verified](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik00NDcuOCA1ODguOGwtNy4zLTMyLjVjLS4yLTEtLjYtMS45LTEuMS0yLjdhNy45NCA3Ljk0IDAgMDAtMTEuMS0yLjJMNDA1IDU2N1Y0MTFjMC00LjQtMy42LTgtOC04aC04MWMtNC40IDAtOCAzLjYtOCA4djM2YzAgNC40IDMuNiA4IDggOGgzN3YxOTIuNGE4IDggMCAwMDEyLjcgNi41bDc5LTU2LjhjMi42LTEuOSAzLjgtNS4xIDMuMS04LjN6bS01Ni43LTIxNi42bC4yLjJjMy4yIDMgOC4zIDIuOCAxMS4zLS41bDI0LjEtMjYuMmE4LjEgOC4xIDAgMDAtLjMtMTEuMmwtNTMuNy01Mi4xYTggOCAwIDAwLTExLjIuMWwtMjQuNyAyNC43Yy0zLjEgMy4xLTMuMSA4LjIuMSAxMS4zbDU0LjIgNTMuN3oiIC8+PHBhdGggZD0iTTg2Ni45IDE2OS45TDUyNy4xIDU0LjFDNTIzIDUyLjcgNTE3LjUgNTIgNTEyIDUycy0xMSAuNy0xNS4xIDIuMUwxNTcuMSAxNjkuOWMtOC4zIDIuOC0xNS4xIDEyLjQtMTUuMSAyMS4ydjQ4Mi40YzAgOC44IDUuNyAyMC40IDEyLjYgMjUuOUw0OTkuMyA5NjhjMy41IDIuNyA4IDQuMSAxMi42IDQuMXM5LjItMS40IDEyLjYtNC4xbDM0NC43LTI2OC42YzYuOS01LjQgMTIuNi0xNyAxMi42LTI1LjlWMTkxLjFjLjItOC44LTYuNi0xOC4zLTE0LjktMjEuMnpNODEwIDY1NC4zTDUxMiA4ODYuNSAyMTQgNjU0LjNWMjI2LjdsMjk4LTEwMS42IDI5OCAxMDEuNnY0MjcuNnoiIC8+PHBhdGggZD0iTTQ1MiAyOTd2MzZjMCA0LjQgMy42IDggOCA4aDEwOHYyNzRoLTM4VjQwNWMwLTQuNC0zLjYtOC04LThoLTM1Yy00LjQgMC04IDMuNi04IDh2MjEwaC0zMWMtNC40IDAtOCAzLjYtOCA4djM3YzAgNC40IDMuNiA4IDggOGgyNDRjNC40IDAgOC0zLjYgOC04di0zN2MwLTQuNC0zLjYtOC04LThoLTcyVjQ5M2g1OGM0LjQgMCA4LTMuNiA4LTh2LTM1YzAtNC40LTMuNi04LTgtOGgtNThWMzQxaDYzYzQuNCAwIDgtMy42IDgtOHYtMzZjMC00LjQtMy42LTgtOC04SDQ2MGMtNC40IDAtOCAzLjYtOCA4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(VerifiedOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'VerifiedOutlined';
}
var _default = exports.default = RefIcon;