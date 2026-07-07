"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AuditOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AuditOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AuditOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AuditOutlined.default
}));

/**![audit](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5NiAyNTBjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMzg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04SDI5NnptMTg0IDE0NEgyOTZjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04em0tNDggNDU4SDIwOFYxNDhoNTYwdjMyMGMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04VjEwOGMwLTE3LjctMTQuMy0zMi0zMi0zMkgxNjhjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjc4NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmgyNjRjNC40IDAgOC0zLjYgOC04di01NmMwLTQuNC0zLjYtOC04LTh6bTQ0MC04OEg3Mjh2LTM2LjZjNDYuMy0xMy44IDgwLTU2LjYgODAtMTA3LjQgMC02MS45LTUwLjEtMTEyLTExMi0xMTJzLTExMiA1MC4xLTExMiAxMTJjMCA1MC43IDMzLjcgOTMuNiA4MCAxMDcuNFY3NjRINTIwYy04LjggMC0xNiA3LjItMTYgMTZ2MTUyYzAgOC44IDcuMiAxNiAxNiAxNmgzNTJjOC44IDAgMTYtNy4yIDE2LTE2Vjc4MGMwLTguOC03LjItMTYtMTYtMTZ6TTY0NiA2MjBjMC0yNy42IDIyLjQtNTAgNTAtNTBzNTAgMjIuNCA1MCA1MC0yMi40IDUwLTUwIDUwLTUwLTIyLjQtNTAtNTB6bTE4MCAyNjZINTY2di02MGgyNjB2NjB6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(AuditOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AuditOutlined';
}
var _default = exports.default = RefIcon;