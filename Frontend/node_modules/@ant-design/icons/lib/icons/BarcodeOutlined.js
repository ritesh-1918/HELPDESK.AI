"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BarcodeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BarcodeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BarcodeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BarcodeOutlined.default
}));

/**![barcode](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyMCAxNjBINzJjLTQuNCAwLTggMy42LTggOHY2ODhjMCA0LjQgMy42IDggOCA4aDQ4YzQuNCAwIDgtMy42IDgtOFYxNjhjMC00LjQtMy42LTgtOC04em04MzMgMGgtNDhjLTQuNCAwLTggMy42LTggOHY2ODhjMCA0LjQgMy42IDggOCA4aDQ4YzQuNCAwIDgtMy42IDgtOFYxNjhjMC00LjQtMy42LTgtOC04ek0yMDAgNzM2aDExMmM0LjQgMCA4LTMuNiA4LThWMTY4YzAtNC40LTMuNi04LTgtOEgyMDBjLTQuNCAwLTggMy42LTggOHY1NjBjMCA0LjQgMy42IDggOCA4em0zMjEgMGg0OGM0LjQgMCA4LTMuNiA4LThWMTY4YzAtNC40LTMuNi04LTgtOGgtNDhjLTQuNCAwLTggMy42LTggOHY1NjBjMCA0LjQgMy42IDggOCA4em0xMjYgMGgxNzhjNC40IDAgOC0zLjYgOC04VjE2OGMwLTQuNC0zLjYtOC04LThINjQ3Yy00LjQgMC04IDMuNi04IDh2NTYwYzAgNC40IDMuNiA4IDggOHptLTI1NSAwaDQ4YzQuNCAwIDgtMy42IDgtOFYxNjhjMC00LjQtMy42LTgtOC04aC00OGMtNC40IDAtOCAzLjYtOCA4djU2MGMwIDQuNCAzLjYgOCA4IDh6bS03OSA2NEgyMDFjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTEyYzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04em0yNTcgMGgtNDhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoNDhjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6bTI1NiAwSDY0OGMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgxNzhjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6bS0zODUgMGgtNDhjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoNDhjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(BarcodeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BarcodeOutlined';
}
var _default = exports.default = RefIcon;