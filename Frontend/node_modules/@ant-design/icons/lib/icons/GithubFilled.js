"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GithubFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GithubFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GithubFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GithubFilled.default
}));

/**![github](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMS42IDc2LjNDMjY0LjMgNzYuMiA2NCAyNzYuNCA2NCA1MjMuNSA2NCA3MTguOSAxODkuMyA4ODUgMzYzLjggOTQ2YzIzLjUgNS45IDE5LjktMTAuOCAxOS45LTIyLjJ2LTc3LjVjLTEzNS43IDE1LjktMTQxLjItNzMuOS0xNTAuMy04OC45QzIxNSA3MjYgMTcxLjUgNzE4IDE4NC41IDcwM2MzMC45LTE1LjkgNjIuNCA0IDk4LjkgNTcuOSAyNi40IDM5LjEgNzcuOSAzMi41IDEwNCAyNiA1LjctMjMuNSAxNy45LTQ0LjUgMzQuNy02MC44LTE0MC42LTI1LjItMTk5LjItMTExLTE5OS4yLTIxMyAwLTQ5LjUgMTYuMy05NSA0OC4zLTEzMS43LTIwLjQtNjAuNSAxLjktMTEyLjMgNC45LTEyMCA1OC4xLTUuMiAxMTguNSA0MS42IDEyMy4yIDQ1LjMgMzMtOC45IDcwLjctMTMuNiAxMTIuOS0xMy42IDQyLjQgMCA4MC4yIDQuOSAxMTMuNSAxMy45IDExLjMtOC42IDY3LjMtNDguOCAxMjEuMy00My45IDIuOSA3LjcgMjQuNyA1OC4zIDUuNSAxMTggMzIuNCAzNi44IDQ4LjkgODIuNyA0OC45IDEzMi4zIDAgMTAyLjItNTkgMTg4LjEtMjAwIDIxMi45YTEyNy41IDEyNy41IDAgMDEzOC4xIDkxdjExMi41Yy44IDkgMCAxNy45IDE1IDE3LjkgMTc3LjEtNTkuNyAzMDQuNi0yMjcgMzA0LjYtNDI0LjEgMC0yNDcuMi0yMDAuNC00NDcuMy00NDcuNS00NDcuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(GithubFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GithubFilled';
}
var _default = exports.default = RefIcon;