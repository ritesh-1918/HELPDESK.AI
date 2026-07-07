"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GoldOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GoldOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GoldOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GoldOutlined.default
}));

/**![gold](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM0MiA0NzJoMzQyYy40IDAgLjkgMCAxLjMtLjEgNC40LS43IDcuMy00LjggNi42LTkuMmwtNDAuMi0yNDhjLS42LTMuOS00LTYuNy03LjktNi43SDM4Mi4yYy0zLjkgMC03LjMgMi44LTcuOSA2LjdsLTQwLjIgMjQ4Yy0uMS40LS4xLjktLjEgMS4zIDAgNC40IDMuNiA4IDggOHptOTEuMi0xOTZoMTU5LjVsMjAuNyAxMjhoLTIwMWwyMC44LTEyOHptMi41IDI4Mi43Yy0uNi0zLjktNC02LjctNy45LTYuN0gxNjYuMmMtMy45IDAtNy4zIDIuOC03LjkgNi43bC00MC4yIDI0OGMtLjEuNC0uMS45LS4xIDEuMyAwIDQuNCAzLjYgOCA4IDhoMzQyYy40IDAgLjkgMCAxLjMtLjEgNC40LS43IDcuMy00LjggNi42LTkuMmwtNDAuMi0yNDh6TTE5Ni41IDc0OGwyMC43LTEyOGgxNTkuNWwyMC43IDEyOEgxOTYuNXptNzA5LjQgNTguN2wtNDAuMi0yNDhjLS42LTMuOS00LTYuNy03LjktNi43SDU5Ni4yYy0zLjkgMC03LjMgMi44LTcuOSA2LjdsLTQwLjIgMjQ4Yy0uMS40LS4xLjktLjEgMS4zIDAgNC40IDMuNiA4IDggOGgzNDJjLjQgMCAuOSAwIDEuMy0uMSA0LjMtLjcgNy4zLTQuOCA2LjYtOS4yek02MjYuNSA3NDhsMjAuNy0xMjhoMTU5LjVsMjAuNyAxMjhINjI2LjV6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(GoldOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GoldOutlined';
}
var _default = exports.default = RefIcon;