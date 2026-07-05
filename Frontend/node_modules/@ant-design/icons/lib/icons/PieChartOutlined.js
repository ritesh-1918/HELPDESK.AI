"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PieChartOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PieChartOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PieChartOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PieChartOutlined.default
}));

/**![pie-chart](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2NCA1MThINTA2VjE2MGMwLTQuNC0zLjYtOC04LThoLTI2YTM5OC40NiAzOTguNDYgMCAwMC0yODIuOCAxMTcuMSAzOTguMTkgMzk4LjE5IDAgMDAtODUuNyAxMjcuMUEzOTcuNjEgMzk3LjYxIDAgMDA3MiA1NTJhMzk4LjQ2IDM5OC40NiAwIDAwMTE3LjEgMjgyLjhjMzYuNyAzNi43IDc5LjUgNjUuNiAxMjcuMSA4NS43QTM5Ny42MSAzOTcuNjEgMCAwMDQ3MiA5NTJhMzk4LjQ2IDM5OC40NiAwIDAwMjgyLjgtMTE3LjFjMzYuNy0zNi43IDY1LjYtNzkuNSA4NS43LTEyNy4xQTM5Ny42MSAzOTcuNjEgMCAwMDg3MiA1NTJ2LTI2YzAtNC40LTMuNi04LTgtOHpNNzA1LjcgNzg3LjhBMzMxLjU5IDMzMS41OSAwIDAxNDcwLjQgODg0Yy04OC4xLS40LTE3MC45LTM0LjktMjMzLjItOTcuMkMxNzQuNSA3MjQuMSAxNDAgNjQwLjcgMTQwIDU1MmMwLTg4LjcgMzQuNS0xNzIuMSA5Ny4yLTIzNC44IDU0LjYtNTQuNiAxMjQuOS04Ny45IDIwMC44LTk1LjVWNTg2aDM2NC4zYy03LjcgNzYuMy00MS4zIDE0Ny05Ni42IDIwMS44ek05NTIgNDYyLjRsLTIuNi0yOC4yYy04LjUtOTIuMS00OS40LTE3OS0xMTUuMi0yNDQuNkEzOTkuNCAzOTkuNCAwIDAwNTg5IDc0LjZMNTYwLjcgNzJjLTQuNy0uNC04LjcgMy4yLTguNyA3LjlWNDY0YzAgNC40IDMuNiA4IDggOGwzODQtMWM0LjcgMCA4LjQtNCA4LTguNnptLTMzMi4yLTU4LjJWMTQ3LjZhMzMyLjI0IDMzMi4yNCAwIDAxMTY2LjQgODkuOGM0NS43IDQ1LjYgNzcgMTAzLjYgOTAgMTY2LjFsLTI1Ni40Ljd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(PieChartOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PieChartOutlined';
}
var _default = exports.default = RefIcon;