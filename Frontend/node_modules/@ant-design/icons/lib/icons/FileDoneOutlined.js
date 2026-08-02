"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileDoneOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileDoneOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileDoneOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileDoneOutlined.default
}));

/**![file-done](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY4OCAzMTJ2LTQ4YzAtNC40LTMuNi04LTgtOEgyOTZjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMzg0YzQuNCAwIDgtMy42IDgtOHptLTM5MiA4OGMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgxODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMjk2em0zNzYgMTE2Yy0xMTkuMyAwLTIxNiA5Ni43LTIxNiAyMTZzOTYuNyAyMTYgMjE2IDIxNiAyMTYtOTYuNyAyMTYtMjE2LTk2LjctMjE2LTIxNi0yMTZ6bTEwNy41IDMyMy41Qzc1MC44IDg2OC4yIDcxMi42IDg4NCA2NzIgODg0cy03OC44LTE1LjgtMTA3LjUtNDQuNUM1MzUuOCA4MTAuOCA1MjAgNzcyLjYgNTIwIDczMnMxNS44LTc4LjggNDQuNS0xMDcuNUM1OTMuMiA1OTUuOCA2MzEuNCA1ODAgNjcyIDU4MHM3OC44IDE1LjggMTA3LjUgNDQuNUM4MDguMiA2NTMuMiA4MjQgNjkxLjQgODI0IDczMnMtMTUuOCA3OC44LTQ0LjUgMTA3LjV6TTc2MSA2NTZoLTQ0LjNjLTIuNiAwLTUgMS4yLTYuNSAzLjNsLTYzLjUgODcuOC0yMy4xLTMxLjlhNy45MiA3LjkyIDAgMDAtNi41LTMuM0g1NzNjLTYuNSAwLTEwLjMgNy40LTYuNSAxMi43bDczLjggMTAyLjFjMy4yIDQuNCA5LjcgNC40IDEyLjkgMGwxMTQuMi0xNThjMy45LTUuMy4xLTEyLjctNi40LTEyLjd6TTQ0MCA4NTJIMjA4VjE0OGg1NjB2MzQ0YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LThWMTA4YzAtMTcuNy0xNC4zLTMyLTMyLTMySDE2OGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2Nzg0YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDI3MmM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileDoneOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileDoneOutlined';
}
var _default = exports.default = RefIcon;