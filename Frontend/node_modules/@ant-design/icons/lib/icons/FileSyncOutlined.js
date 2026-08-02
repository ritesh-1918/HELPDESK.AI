"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileSyncOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileSyncOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileSyncOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileSyncOutlined.default
}));

/**![file-sync](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5NiAyNTZjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMzg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04SDI5NnptMTkyIDIwMHYtNDhjMC00LjQtMy42LTgtOC04SDI5NmMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgxODRjNC40IDAgOC0zLjYgOC04em0tNDggMzk2SDIwOFYxNDhoNTYwdjM0NGMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04VjEwOGMwLTE3LjctMTQuMy0zMi0zMi0zMkgxNjhjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjc4NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmgyNzJjNC40IDAgOC0zLjYgOC04di01NmMwLTQuNC0zLjYtOC04LTh6bTEwNC4xLTExNS42YzEuOC0zNC41IDE2LjItNjYuOCA0MC44LTkxLjQgMjYuMi0yNi4yIDYyLTQxIDk5LjEtNDEgMzcuNCAwIDcyLjYgMTQuNiA5OS4xIDQxIDMuMiAzLjIgNi4zIDYuNiA5LjIgMTAuMUw3NjkuMiA2NzNhOCA4IDAgMDAzIDE0LjFsOTMuMyAyMi41YzUgMS4yIDkuOC0yLjYgOS45LTcuN2wuNi05NS40YTggOCAwIDAwLTEyLjktNi40bC0yMC4zIDE1LjhDODA1LjQgNTY5LjYgNzQ4LjEgNTQwIDY4NCA1NDBjLTEwOS45IDAtMTk5LjYgODYuOS0yMDQgMTk1LjctLjIgNC41IDMuNSA4LjMgOCA4LjNoNDguMWM0LjMgMCA3LjgtMy4zIDgtNy42ek04ODAgNzQ0aC00OC4xYy00LjMgMC03LjggMy4zLTggNy42LTEuOCAzNC41LTE2LjIgNjYuOC00MC44IDkxLjQtMjYuMiAyNi4yLTYyIDQxLTk5LjEgNDEtMzcuNCAwLTcyLjYtMTQuNi05OS4xLTQxLTMuMi0zLjItNi4zLTYuNi05LjItMTAuMWwyMy4xLTE3LjlhOCA4IDAgMDAtMy0xNC4xbC05My4zLTIyLjVjLTUtMS4yLTkuOCAyLjYtOS45IDcuN2wtLjYgOTUuNGE4IDggMCAwMDEyLjkgNi40bDIwLjMtMTUuOEM1NjIuNiA5MTguNCA2MTkuOSA5NDggNjg0IDk0OGMxMDkuOSAwIDE5OS42LTg2LjkgMjA0LTE5NS43LjItNC41LTMuNS04LjMtOC04LjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileSyncOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileSyncOutlined';
}
var _default = exports.default = RefIcon;