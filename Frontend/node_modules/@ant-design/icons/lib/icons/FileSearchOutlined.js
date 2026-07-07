"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileSearchOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileSearchOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileSearchOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileSearchOutlined.default
}));

/**![file-search](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY4OCAzMTJ2LTQ4YzAtNC40LTMuNi04LTgtOEgyOTZjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMzg0YzQuNCAwIDgtMy42IDgtOHptLTM5MiA4OGMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgxODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMjk2em0xNDQgNDUySDIwOFYxNDhoNTYwdjM0NGMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04VjEwOGMwLTE3LjctMTQuMy0zMi0zMi0zMkgxNjhjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjc4NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmgyNzJjNC40IDAgOC0zLjYgOC04di01NmMwLTQuNC0zLjYtOC04LTh6bTQ0NS43IDUxLjVsLTkzLjMtOTMuM0M4MTQuNyA3ODAuNyA4MjggNzQzLjkgODI4IDcwNGMwLTk3LjItNzguOC0xNzYtMTc2LTE3NnMtMTc2IDc4LjgtMTc2IDE3NiA3OC44IDE3NiAxNzYgMTc2YzM1LjggMCA2OS0xMC43IDk2LjgtMjlsOTQuNyA5NC43YzEuNiAxLjYgMy42IDIuMyA1LjYgMi4zczQuMS0uOCA1LjYtMi4zbDMxLTMxYTcuOSA3LjkgMCAwMDAtMTEuMnpNNjUyIDgxNmMtNjEuOSAwLTExMi01MC4xLTExMi0xMTJzNTAuMS0xMTIgMTEyLTExMiAxMTIgNTAuMSAxMTIgMTEyLTUwLjEgMTEyLTExMiAxMTJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileSearchOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileSearchOutlined';
}
var _default = exports.default = RefIcon;