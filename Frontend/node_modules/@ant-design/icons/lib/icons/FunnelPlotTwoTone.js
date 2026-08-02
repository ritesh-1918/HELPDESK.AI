"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FunnelPlotTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FunnelPlotTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FunnelPlotTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FunnelPlotTwoTone.default
}));

/**![funnel-plot](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQyMC42IDc5OGgxODIuOVY2NTBINDIwLjZ6TTI5Ny43IDM3NGg0MjguNmw4NS0xNDhIMjEyLjd6bTExMy4yIDE5Ny40bDguNCAxNC42aDE4NS4zbDguNC0xNC42TDY4OS42IDQzOEgzMzQuNHoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTg4MC4xIDE1NEgxNDMuOWMtMjQuNSAwLTM5LjggMjYuNy0yNy41IDQ4TDM0OSA2MDcuNFY4MzhjMCAxNy43IDE0LjIgMzIgMzEuOCAzMmgyNjIuNGMxNy42IDAgMzEuOC0xNC4zIDMxLjgtMzJWNjA3LjRMOTA3LjcgMjAyYzEyLjItMjEuMy0zLjEtNDgtMjcuNi00OHpNNjAzLjUgNzk4SDQyMC42VjY1MGgxODIuOXYxNDh6bTkuNS0yMjYuNmwtOC40IDE0LjZINDE5LjNsLTguNC0xNC42TDMzNC40IDQzOGgzNTUuMkw2MTMgNTcxLjR6TTcyNi4zIDM3NEgyOTcuN2wtODUtMTQ4aDU5OC42bC04NSAxNDh6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FunnelPlotTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FunnelPlotTwoTone';
}
var _default = exports.default = RefIcon;