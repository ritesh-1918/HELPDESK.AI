"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _InsuranceFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/InsuranceFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const InsuranceFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _InsuranceFilled.default
}));

/**![insurance](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxOS45IDM1OC44aDk3Ljl2NDEuNmgtOTcuOXptMzQ3LTE4OC45TDUyNy4xIDU0LjFDNTIzIDUyLjcgNTE3LjUgNTIgNTEyIDUycy0xMSAuNy0xNS4xIDIuMUwxNTcuMSAxNjkuOWMtOC4zIDIuOC0xNS4xIDEyLjQtMTUuMSAyMS4ydjQ4Mi40YzAgOC44IDUuNyAyMC40IDEyLjYgMjUuOUw0OTkuMyA5NjhjMy41IDIuNyA4IDQuMSAxMi42IDQuMXM5LjItMS40IDEyLjYtNC4xbDM0NC43LTI2OC42YzYuOS01LjQgMTIuNi0xNyAxMi42LTI1LjlWMTkxLjFjLjItOC44LTYuNi0xOC4zLTE0LjktMjEuMnpNNDExLjMgNjU2aC0uMmMwIDQuNC0zLjYgOC04IDhoLTM3LjNjLTQuNCAwLTgtMy42LTgtOFY0NzEuNGMtNy43IDkuMi0xNS40IDE3LjktMjMuMSAyNmE2LjA0IDYuMDQgMCAwMS0xMC4yLTIuNGwtMTMuMi00My41Yy0uNi0yLS4yLTQuMSAxLjItNS42IDM3LTQzLjQgNjQuNy05NS4xIDgyLjItMTUzLjYgMS4xLTMuNSA1LTUuMyA4LjQtMy43bDM4LjYgMTguM2MyLjcgMS4zIDQuMSA0LjQgMy4yIDcuMmE0MjkuMiA0MjkuMiAwIDAxLTMzLjYgNzlWNjU2em0yOTYuNS00OS4ybC0yNi4zIDM1LjNhNS45MiA1LjkyIDAgMDEtOC45LjdjLTMwLjYtMjkuMy01Ni44LTY1LjItNzguMS0xMDYuOVY2NTZjMCA0LjQtMy42IDgtOCA4aC0zNi4yYy00LjQgMC04LTMuNi04LThWNTM2Yy0yMiA0NC43LTQ5IDgwLjgtODAuNiAxMDcuNmE1LjkgNS45IDAgMDEtOC45LTEuNEw0MzAgNjA1LjdhNiA2IDAgMDExLjYtOC4xYzI4LjYtMjAuMyA1MS45LTQ1LjIgNzEtNzZoLTU1LjFjLTQuNCAwLTgtMy42LTgtOFY0NzhjMC00LjQgMy42LTggOC04aDk0Ljl2LTE4LjZoLTY1LjljLTQuNCAwLTgtMy42LTgtOFYzMTZjMC00LjQgMy42LTggOC04aDE4NC43YzQuNCAwIDggMy42IDggOHYxMjcuMmMwIDQuNC0zLjYgOC04IDhoLTY2Ljd2MTguNmg5OC44YzQuNCAwIDggMy42IDggOHYzNS42YzAgNC40LTMuNiA4LTggOGgtNTljMTguMSAyOS4xIDQxLjggNTQuMyA3Mi4zIDc2LjkgMi42IDIuMSAzLjIgNS45IDEuMiA4LjV6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(InsuranceFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'InsuranceFilled';
}
var _default = exports.default = RefIcon;