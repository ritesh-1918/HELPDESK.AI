"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SolutionOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SolutionOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SolutionOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SolutionOutlined.default
}));

/**![solution](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY4OCAyNjRjMC00LjQtMy42LTgtOC04SDI5NmMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgzODRjNC40IDAgOC0zLjYgOC04di00OHptLTggMTM2SDI5NmMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6TTQ4MCA1NDRIMjk2Yy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDE4NGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHptLTQ4IDMwOEgyMDhWMTQ4aDU2MHYzNDRjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOFYxMDhjMC0xNy43LTE0LjMtMzItMzItMzJIMTY4Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3ODRjMCAxNy43IDE0LjMgMzIgMzIgMzJoMjY0YzQuNCAwIDgtMy42IDgtOHYtNTZjMC00LjQtMy42LTgtOC04em0zNTYuOC03NC40YzI5LTI2LjMgNDcuMi02NC4zIDQ3LjItMTA2LjYgMC03OS41LTY0LjUtMTQ0LTE0NC0xNDRzLTE0NCA2NC41LTE0NCAxNDRjMCA0Mi4zIDE4LjIgODAuMyA0Ny4yIDEwNi42LTU3IDMyLjUtOTYuMiA5Mi43LTk5LjIgMTYyLjEtLjIgNC41IDMuNSA4LjMgOCA4LjNoNDguMWM0LjIgMCA3LjctMy4zIDgtNy42QzU2NCA4NzEuMiA2MjEuNyA4MTYgNjkyIDgxNnMxMjggNTUuMiAxMzEuOSAxMjQuNGMuMiA0LjIgMy43IDcuNiA4IDcuNkg4ODBjNC42IDAgOC4yLTMuOCA4LTguMy0yLjktNjkuNS00Mi4yLTEyOS42LTk5LjItMTYyLjF6TTY5MiA1OTFjNDQuMiAwIDgwIDM1LjggODAgODBzLTM1LjggODAtODAgODAtODAtMzUuOC04MC04MCAzNS44LTgwIDgwLTgweiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SolutionOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SolutionOutlined';
}
var _default = exports.default = RefIcon;