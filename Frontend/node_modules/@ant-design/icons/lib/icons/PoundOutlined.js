"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PoundOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PoundOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PoundOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PoundOutlined.default
}));

/**![pound](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnptMTM4LTIwOS44SDQ2OS44di00LjdjMjcuNC0xNy4yIDQzLjktNTAuNCA0My45LTkxLjEgMC0xNC4xLTIuMi0yNy45LTUuMy00MUg2MDdjNC40IDAgOC0zLjYgOC04di0zMGMwLTQuNC0zLjYtOC04LThINDk1Yy03LjItMjIuNi0xMy40LTQ1LjctMTMuNC03MC41IDAtNDMuNSAzNC03MC4yIDg3LjMtNzAuMiAyMS41IDAgNDIuNSA0LjEgNjAuNCAxMC41IDUuMiAxLjkgMTAuNi0yIDEwLjYtNy42di0zOS41YzAtMy4zLTIuMS02LjMtNS4yLTcuNS0xOC44LTcuMi00My44LTEyLjctNzAuMy0xMi43LTkyLjkgMC0xNTEuNSA0NC41LTE1MS41IDEyMC4zIDAgMjYuMyA2LjkgNTIgMTQuNiA3Ny4xSDM3NGMtNC40IDAtOCAzLjYtOCA4djMwYzAgNC40IDMuNiA4IDggOGg2Ny4xYzMuNCAxNC43IDUuOSAyOS40IDUuOSA0NC4yIDAgNDUuMi0yOC44IDgzLjMtNzIuOCA5NC4yLTMuNi45LTYuMSA0LjEtNi4xIDcuOFY3MjJjMCA0LjQgMy42IDggOCA4SDY1MGM0LjQgMCA4LTMuNiA4LTh2LTM5LjhjMC00LjQtMy42LTgtOC04eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PoundOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PoundOutlined';
}
var _default = exports.default = RefIcon;