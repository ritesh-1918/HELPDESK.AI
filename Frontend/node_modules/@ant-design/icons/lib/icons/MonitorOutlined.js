"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MonitorOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MonitorOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MonitorOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MonitorOutlined.default
}));

/**![monitor](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY5Mi44IDQxMi43bC4yLS4yLTM0LjYtNDQuM2E3Ljk3IDcuOTcgMCAwMC0xMS4yLTEuNGwtNTAuNCAzOS4zLTcwLjUtOTAuMWE3Ljk3IDcuOTcgMCAwMC0xMS4yLTEuNGwtMzcuOSAyOS43YTcuOTcgNy45NyAwIDAwLTEuNCAxMS4ybDcwLjUgOTAuMi0uMi4xIDM0LjYgNDQuM2MyLjcgMy41IDcuNyA0LjEgMTEuMiAxLjRsNTAuNC0zOS4zIDY0LjEgODJjMi43IDMuNSA3LjcgNC4xIDExLjIgMS40bDM3LjktMjkuNmMzLjUtMi43IDQuMS03LjcgMS40LTExLjJsLTY0LjEtODIuMXpNNjA4IDExMmMtMTY3LjkgMC0zMDQgMTM2LjEtMzA0IDMwNCAwIDcwLjMgMjMuOSAxMzUgNjMuOSAxODYuNUwxMTQuMyA4NTYuMWE4LjAzIDguMDMgMCAwMDAgMTEuM2w0Mi4zIDQyLjNjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGwyNTMuNi0yNTMuNkM0NzMgNjk2LjEgNTM3LjcgNzIwIDYwOCA3MjBjMTY3LjkgMCAzMDQtMTM2LjEgMzA0LTMwNFM3NzUuOSAxMTIgNjA4IDExMnptMTYxLjIgNDY1LjJDNzI2LjIgNjIwLjMgNjY4LjkgNjQ0IDYwOCA2NDRzLTExOC4yLTIzLjctMTYxLjItNjYuOEM0MDMuNyA1MzQuMiAzODAgNDc2LjkgMzgwIDQxNnMyMy43LTExOC4yIDY2LjgtMTYxLjJjNDMtNDMuMSAxMDAuMy02Ni44IDE2MS4yLTY2LjhzMTE4LjIgMjMuNyAxNjEuMiA2Ni44YzQzLjEgNDMgNjYuOCAxMDAuMyA2Ni44IDE2MS4ycy0yMy43IDExOC4yLTY2LjggMTYxLjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MonitorOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MonitorOutlined';
}
var _default = exports.default = RefIcon;