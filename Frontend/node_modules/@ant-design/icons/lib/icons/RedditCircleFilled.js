"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RedditCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RedditCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RedditCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RedditCircleFilled.default
}));

/**![reddit-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU4NCA1NDhhMzYgMzYgMCAxMDcyIDAgMzYgMzYgMCAxMC03MiAwem0xNDQtMTA4YTM1LjkgMzUuOSAwIDAwLTMyLjUgMjAuNmMxOC44IDE0LjMgMzQuNCAzMC43IDQ1LjkgNDguOEEzNS45OCAzNS45OCAwIDAwNzI4IDQ0MHpNNTEyIDY0QzI2NC42IDY0IDY0IDI2NC42IDY0IDUxMnMyMDAuNiA0NDggNDQ4IDQ0OCA0NDgtMjAwLjYgNDQ4LTQ0OFM3NTkuNCA2NCA1MTIgNjR6bTI0NSA0NzcuOWM0LjYgMTMuNSA3IDI3LjYgNyA0Mi4xIDAgOTkuNC0xMTIuOCAxODAtMjUyIDE4MHMtMjUyLTgwLjYtMjUyLTE4MGMwLTE0LjUgMi40LTI4LjYgNy00Mi4xQTcyLjAxIDcyLjAxIDAgMDEyOTYgNDA0YzI3LjEgMCA1MC42IDE0LjkgNjIuOSAzNyAzNi4yLTE5LjggODAuMi0zMi44IDEyOC4xLTM2LjFsNTguNC0xMzEuMWM0LjMtOS44IDE1LjItMTQuOCAyNS41LTExLjhsOTEuNiAyNi41YTU0LjAzIDU0LjAzIDAgMDExMDEuNiAyNS42YzAgMjkuOC0yNC4yIDU0LTU0IDU0LTIzLjUgMC00My41LTE1LjEtNTAuOS0zNi4xTDU3NyAzMDguM2wtNDMgOTYuNWM0OS4xIDMgOTQuMiAxNi4xIDEzMS4yIDM2LjMgMTIuMy0yMi4xIDM1LjgtMzcgNjIuOS0zNyAzOS44IDAgNzIgMzIuMiA3MiA3Mi0uMSAyOS4zLTE3LjggNTQuNi00My4xIDY1Ljh6bS0xNzEuMyA4M2MtMTQuOSAxMS43LTQ0LjMgMjQuMy03My43IDI0LjNzLTU4LjktMTIuNi03My43LTI0LjNjLTkuMy03LjMtMjIuNy01LjctMzAgMy42LTcuMyA5LjMtNS43IDIyLjcgMy42IDMwIDI1LjcgMjAuNCA2NSAzMy41IDEwMC4xIDMzLjUgMzUuMSAwIDc0LjQtMTMuMSAxMDAuMi0zMy41IDkuMy03LjMgMTAuOS0yMC44IDMuNi0zMGEyMS40NiAyMS40NiAwIDAwLTMwLjEtMy42ek0yOTYgNDQwYTM1Ljk4IDM1Ljk4IDAgMDAtMTMuNCA2OS40YzExLjUtMTguMSAyNy4xLTM0LjUgNDUuOS00OC44QTM1LjkgMzUuOSAwIDAwMjk2IDQ0MHptNzIgMTA4YTM2IDM2IDAgMTA3MiAwIDM2IDM2IDAgMTAtNzIgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(RedditCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RedditCircleFilled';
}
var _default = exports.default = RefIcon;