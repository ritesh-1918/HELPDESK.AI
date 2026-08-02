"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CommentOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CommentOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CommentOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CommentOutlined.default
}));

/**![comment](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik01NzMgNDIxYy0yMy4xIDAtNDEgMTcuOS00MSA0MHMxNy45IDQwIDQxIDQwYzIxLjEgMCAzOS0xNy45IDM5LTQwcy0xNy45LTQwLTM5LTQwem0tMjgwIDBjLTIzLjEgMC00MSAxNy45LTQxIDQwczE3LjkgNDAgNDEgNDBjMjEuMSAwIDM5LTE3LjkgMzktNDBzLTE3LjktNDAtMzktNDB6IiAvPjxwYXRoIGQ9Ik04OTQgMzQ1YTM0My45MiAzNDMuOTIgMCAwMC0xODktMTMwdi4xYy0xNy4xLTE5LTM2LjQtMzYuNS01OC01Mi4xLTE2My43LTExOS0zOTMuNS04Mi43LTUxMyA4MS05Ni4zIDEzMy05Mi4yIDMxMS45IDYgNDM5bC44IDEzMi42YzAgMy4yLjUgNi40IDEuNSA5LjRhMzEuOTUgMzEuOTUgMCAwMDQwLjEgMjAuOUwzMDkgODA2YzMzLjUgMTEuOSA2OC4xIDE4LjcgMTAyLjUgMjAuNmwtLjUuNGM4OS4xIDY0LjkgMjA1LjkgODQuNCAzMTMgNDlsMTI3LjEgNDEuNGMzLjIgMSA2LjUgMS42IDkuOSAxLjYgMTcuNyAwIDMyLTE0LjMgMzItMzJWNzUzYzg4LjEtMTE5LjYgOTAuNC0yODQuOSAxLTQwOHpNMzIzIDczNWwtMTItNS05OSAzMS0xLTEwNC04LTljLTg0LjYtMTAzLjItOTAuMi0yNTEuOS0xMS0zNjEgOTYuNC0xMzIuMiAyODEuMi0xNjEuNCA0MTMtNjYgMTMyLjIgOTYuMSAxNjEuNSAyODAuNiA2NiA0MTItODAuMSAxMDkuOS0yMjMuNSAxNTAuNS0zNDggMTAyem01MDUtMTdsLTggMTAgMSAxMDQtOTgtMzMtMTIgNWMtNTYgMjAuOC0xMTUuNyAyMi41LTE3MSA3bC0uMi0uMUEzNjcuMzEgMzY3LjMxIDAgMDA3MjkgNjc2Yzc2LjQtMTA1LjMgODguOC0yMzcuNiA0NC40LTM1MC40bC42LjRjMjMgMTYuNSA0NC4xIDM3LjEgNjIgNjIgNzIuNiA5OS42IDY4LjUgMjM1LjItOCAzMzB6IiAvPjxwYXRoIGQ9Ik00MzMgNDIxYy0yMy4xIDAtNDEgMTcuOS00MSA0MHMxNy45IDQwIDQxIDQwYzIxLjEgMCAzOS0xNy45IDM5LTQwcy0xNy45LTQwLTM5LTQweiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CommentOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CommentOutlined';
}
var _default = exports.default = RefIcon;