"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ChromeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ChromeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ChromeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ChromeFilled.default
}));

/**![chrome](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM3MS44IDUxMmMwIDc3LjUgNjIuNyAxNDAuMiAxNDAuMiAxNDAuMlM2NTIuMiA1ODkuNSA2NTIuMiA1MTIgNTg5LjUgMzcxLjggNTEyIDM3MS44IDM3MS44IDQzNC40IDM3MS44IDUxMnpNOTAwIDM2Mi40bC0yMzQuMyAxMi4xYzYzLjYgNzQuMyA2NC42IDE4MS41IDExLjEgMjYzLjdsLTE4OCAyODkuMmM3OCA0LjIgMTU4LjQtMTIuOSAyMzEuMi01NS4yIDE4MC0xMDQgMjUzLTMyMi4xIDE4MC01MDkuOHpNMzIwLjMgNTkxLjlMMTYzLjggMjg0LjFBNDE1LjM1IDQxNS4zNSAwIDAwOTYgNTEyYzAgMjA4IDE1Mi4zIDM4MC4zIDM1MS40IDQxMC44bDEwNi45LTIwOS40Yy05Ni42IDE4LjItMTg5LjktMzQuOC0yMzQtMTIxLjV6bTIxOC41LTI4NS41bDM0NC40IDE4LjFDODQ4IDI1NC43IDc5Mi42IDE5NCA3MTkuOCAxNTEuNyA2NTMuOSAxMTMuNiA1ODEuNSA5NS41IDUxMC41IDk2Yy0xMjIuNS41LTI0Mi4yIDU1LjItMzIyLjEgMTU0LjVsMTI4LjIgMTk2LjljMzItOTEuOSAxMjQuOC0xNDYuNyAyMjIuMi0xNDF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ChromeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ChromeFilled';
}
var _default = exports.default = RefIcon;