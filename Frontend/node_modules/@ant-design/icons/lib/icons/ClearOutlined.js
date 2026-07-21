"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ClearOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ClearOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ClearOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ClearOutlined.default
}));

/**![clear](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik04OTkuMSA4NjkuNmwtNTMtMzA1LjZIODY0YzE0LjQgMCAyNi0xMS42IDI2LTI2VjM0NmMwLTE0LjQtMTEuNi0yNi0yNi0yNkg2MThWMTM4YzAtMTQuNC0xMS42LTI2LTI2LTI2SDQzMmMtMTQuNCAwLTI2IDExLjYtMjYgMjZ2MTgySDE2MGMtMTQuNCAwLTI2IDExLjYtMjYgMjZ2MTkyYzAgMTQuNCAxMS42IDI2IDI2IDI2aDE3LjlsLTUzIDMwNS42YTI1Ljk1IDI1Ljk1IDAgMDAyNS42IDMwLjRoNzIzYzEuNSAwIDMtLjEgNC40LS40YTI1Ljg4IDI1Ljg4IDAgMDAyMS4yLTMwek0yMDQgMzkwaDI3MlYxODJoNzJ2MjA4aDI3MnYxMDRIMjA0VjM5MHptNDY4IDQ0MFY2NzRjMC00LjQtMy42LTgtOC04aC00OGMtNC40IDAtOCAzLjYtOCA4djE1Nkg0MTZWNjc0YzAtNC40LTMuNi04LTgtOGgtNDhjLTQuNCAwLTggMy42LTggOHYxNTZIMjAyLjhsNDUuMS0yNjBINzc2bDQ1LjEgMjYwSDY3MnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ClearOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ClearOutlined';
}
var _default = exports.default = RefIcon;