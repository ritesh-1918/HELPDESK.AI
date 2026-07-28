"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DeploymentUnitOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DeploymentUnitOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DeploymentUnitOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DeploymentUnitOutlined.default
}));

/**![deployment-unit](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4OC4zIDY5My4yYy00Mi41LTI0LjYtOTQuMy0xOC0xMjkuMiAxMi44bC01My0zMC43VjUyMy42YzAtMTUuNy04LjQtMzAuMy0yMi0zOC4xbC0xMzYtNzguM3YtNjcuMWM0NC4yLTE1IDc2LTU2LjggNzYtMTA2LjEgMC02MS45LTUwLjEtMTEyLTExMi0xMTJzLTExMiA1MC4xLTExMiAxMTJjMCA0OS4zIDMxLjggOTEuMSA3NiAxMDYuMXY2Ny4xbC0xMzYgNzguM2MtMTMuNiA3LjgtMjIgMjIuNC0yMiAzOC4xdjE1MS42bC01MyAzMC43Yy0zNC45LTMwLjgtODYuOC0zNy40LTEyOS4yLTEyLjgtNTMuNSAzMS03MS43IDk5LjQtNDEgMTUyLjkgMzAuOCA1My41IDk4LjkgNzEuOSAxNTIuMiA0MSA0Mi41LTI0LjYgNjIuNy03MyA1My42LTExOC44bDQ4LjctMjguMyAxNDAuNiA4MWM2LjggMy45IDE0LjQgNS45IDIyIDUuOXMxNS4yLTIgMjItNS45TDY3NC41IDc0MGw0OC43IDI4LjNjLTkuMSA0NS43IDExLjIgOTQuMiA1My42IDExOC44IDUzLjMgMzAuOSAxMjEuNSAxMi42IDE1Mi4yLTQxIDMwLjgtNTMuNiAxMi42LTEyMi00MC43LTE1Mi45em0tNjczIDEzOC40YTQ3LjYgNDcuNiAwIDAxLTY1LjItMTcuNmMtMTMuMi0yMi45LTUuNC01Mi4zIDE3LjUtNjUuNWE0Ny42IDQ3LjYgMCAwMTY1LjIgMTcuNmMxMy4yIDIyLjkgNS40IDUyLjMtMTcuNSA2NS41ek01MjIgNDYzLjh6TTQ2NCAyMzRhNDguMDEgNDguMDEgMCAwMTk2IDAgNDguMDEgNDguMDEgMCAwMS05NiAwem0xNzAgNDQ2LjJsLTEyMiA3MC4zLTEyMi03MC4zVjUzOS44bDEyMi03MC4zIDEyMiA3MC4zdjE0MC40em0yMzkuOSAxMzMuOWMtMTMuMiAyMi45LTQyLjQgMzAuOC02NS4yIDE3LjYtMjIuOC0xMy4yLTMwLjctNDIuNi0xNy41LTY1LjVzNDIuNC0zMC44IDY1LjItMTcuNmMyMi45IDEzLjIgMzAuNyA0Mi41IDE3LjUgNjUuNXoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DeploymentUnitOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DeploymentUnitOutlined';
}
var _default = exports.default = RefIcon;