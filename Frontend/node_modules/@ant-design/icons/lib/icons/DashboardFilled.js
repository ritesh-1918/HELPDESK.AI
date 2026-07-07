"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DashboardFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DashboardFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DashboardFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DashboardFilled.default
}));

/**![dashboard](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNC44IDM4NS42YTQ0Ni43IDQ0Ni43IDAgMDAtOTYtMTQyLjQgNDQ2LjcgNDQ2LjcgMCAwMC0xNDIuNC05NkM2MzEuMSAxMjMuOCA1NzIuNSAxMTIgNTEyIDExMnMtMTE5LjEgMTEuOC0xNzQuNCAzNS4yYTQ0Ni43IDQ0Ni43IDAgMDAtMTQyLjQgOTYgNDQ2LjcgNDQ2LjcgMCAwMC05NiAxNDIuNEM3NS44IDQ0MC45IDY0IDQ5OS41IDY0IDU2MGMwIDEzMi43IDU4LjMgMjU3LjcgMTU5LjkgMzQzLjFsMS43IDEuNGM1LjggNC44IDEzLjEgNy41IDIwLjYgNy41aDUzMS43YzcuNSAwIDE0LjgtMi43IDIwLjYtNy41bDEuNy0xLjRDOTAxLjcgODE3LjcgOTYwIDY5Mi43IDk2MCA1NjBjMC02MC41LTExLjktMTE5LjEtMzUuMi0xNzQuNHpNNDgyIDIzMmMwLTQuNCAzLjYtOCA4LThoNDRjNC40IDAgOCAzLjYgOCA4djgwYzAgNC40LTMuNiA4LTggOGgtNDRjLTQuNCAwLTgtMy42LTgtOHYtODB6TTI3MCA1ODJjMCA0LjQtMy42IDgtOCA4aC04MGMtNC40IDAtOC0zLjYtOC04di00NGMwLTQuNCAzLjYtOCA4LThoODBjNC40IDAgOCAzLjYgOCA4djQ0em05MC43LTIwNC41bC0zMS4xIDMxLjFhOC4wMyA4LjAzIDAgMDEtMTEuMyAwTDI2MS43IDM1MmE4LjAzIDguMDMgMCAwMTAtMTEuM2wzMS4xLTMxLjFjMy4xLTMuMSA4LjItMy4xIDExLjMgMGw1Ni42IDU2LjZjMy4xIDMuMSAzLjEgOC4yIDAgMTEuM3ptMjkxLjEgODMuNmwtODQuNSA4NC41YzUgMTguNy4yIDM5LjQtMTQuNSA1NC4xYTU1Ljk1IDU1Ljk1IDAgMDEtNzkuMiAwIDU1Ljk1IDU1Ljk1IDAgMDEwLTc5LjIgNTUuODcgNTUuODcgMCAwMTU0LjEtMTQuNWw4NC41LTg0LjVjMy4xLTMuMSA4LjItMy4xIDExLjMgMGwyOC4zIDI4LjNjMy4xIDMuMSAzLjEgOC4xIDAgMTEuM3ptNDMtNTIuNGwtMzEuMS0zMS4xYTguMDMgOC4wMyAwIDAxMC0xMS4zbDU2LjYtNTYuNmMzLjEtMy4xIDguMi0zLjEgMTEuMyAwbDMxLjEgMzEuMWMzLjEgMy4xIDMuMSA4LjIgMCAxMS4zbC01Ni42IDU2LjZhOC4wMyA4LjAzIDAgMDEtMTEuMyAwek04NDYgNTgyYzAgNC40LTMuNiA4LTggOGgtODBjLTQuNCAwLTgtMy42LTgtOHYtNDRjMC00LjQgMy42LTggOC04aDgwYzQuNCAwIDggMy42IDggOHY0NHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DashboardFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DashboardFilled';
}
var _default = exports.default = RefIcon;