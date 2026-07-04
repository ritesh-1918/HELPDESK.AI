"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LineHeightOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LineHeightOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LineHeightOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LineHeightOutlined.default
}));

/**![line-height](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY0OCAxNjBIMTA0Yy00LjQgMC04IDMuNi04IDh2MTI4YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LTh2LTY0aDE2OHY1NjBoLTkyYy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDI2NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOGgtOTJWMjMyaDE2OHY2NGMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04VjE2OGMwLTQuNC0zLjYtOC04LTh6bTI3Mi44IDU0Nkg4NTZWMzE4aDY0LjhjNiAwIDkuNC03IDUuNy0xMS43TDgyNS43IDE3OC43YTcuMTQgNy4xNCAwIDAwLTExLjMgMEw3MTMuNiAzMDYuM2E3LjIzIDcuMjMgMCAwMDUuNyAxMS43SDc4NHYzODhoLTY0LjhjLTYgMC05LjQgNy01LjcgMTEuN2wxMDAuOCAxMjcuNWMyLjkgMy43IDguNSAzLjcgMTEuMyAwbDEwMC44LTEyNy41YTcuMiA3LjIgMCAwMC01LjYtMTEuN3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LineHeightOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LineHeightOutlined';
}
var _default = exports.default = RefIcon;