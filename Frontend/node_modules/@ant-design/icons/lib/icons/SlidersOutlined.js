"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SlidersOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SlidersOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SlidersOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SlidersOutlined.default
}));

/**![sliders](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMyMCAyMjRoLTY2di01NmMwLTQuNC0zLjYtOC04LThoLTUyYy00LjQgMC04IDMuNi04IDh2NTZoLTY2Yy00LjQgMC04IDMuNi04IDh2NTYwYzAgNC40IDMuNiA4IDggOGg2NnY1NmMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04di01Nmg2NmM0LjQgMCA4LTMuNiA4LThWMjMyYzAtNC40LTMuNi04LTgtOHptLTYwIDUwOGgtODBWMjkyaDgwdjQ0MHptNjQ0LTQzNmgtNjZ2LTk2YzAtNC40LTMuNi04LTgtOGgtNTJjLTQuNCAwLTggMy42LTggOHY5NmgtNjZjLTQuNCAwLTggMy42LTggOHY0MTZjMCA0LjQgMy42IDggOCA4aDY2djk2YzAgNC40IDMuNiA4IDggOGg1MmM0LjQgMCA4LTMuNiA4LTh2LTk2aDY2YzQuNCAwIDgtMy42IDgtOFYzMDRjMC00LjQtMy42LTgtOC04em0tNjAgMzY0aC04MFYzNjRoODB2Mjk2ek02MTIgNDA0aC02NlYyMzJjMC00LjQtMy42LTgtOC04aC01MmMtNC40IDAtOCAzLjYtOCA4djE3MmgtNjZjLTQuNCAwLTggMy42LTggOHYyMDBjMCA0LjQgMy42IDggOCA4aDY2djE3MmMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04VjYyMGg2NmM0LjQgMCA4LTMuNiA4LThWNDEyYzAtNC40LTMuNi04LTgtOHptLTYwIDE0NWEzIDMgMCAwMS0zIDNoLTc0YTMgMyAwIDAxLTMtM3YtNzRhMyAzIDAgMDEzLTNoNzRhMyAzIDAgMDEzIDN2NzR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SlidersOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SlidersOutlined';
}
var _default = exports.default = RefIcon;