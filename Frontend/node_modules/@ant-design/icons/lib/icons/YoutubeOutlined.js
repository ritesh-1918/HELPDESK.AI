"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _YoutubeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/YoutubeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const YoutubeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _YoutubeOutlined.default
}));

/**![youtube](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTk2MCA1MDkuMmMwLTIuMiAwLTQuNy0uMS03LjYtLjEtOC4xLS4zLTE3LjItLjUtMjYuOS0uOC0yNy45LTIuMi01NS43LTQuNC04MS45LTMtMzYuMS03LjQtNjYuMi0xMy40LTg4LjhhMTM5LjUyIDEzOS41MiAwIDAwLTk4LjMtOTguNWMtMjguMy03LjYtODMuNy0xMi4zLTE2MS43LTE1LjItMzcuMS0xLjQtNzYuOC0yLjMtMTE2LjUtMi44LTEzLjktLjItMjYuOC0uMy0zOC40LS40aC0yOS40Yy0xMS42LjEtMjQuNS4yLTM4LjQuNC0zOS43LjUtNzkuNCAxLjQtMTE2LjUgMi44LTc4IDMtMTMzLjUgNy43LTE2MS43IDE1LjJBMTM5LjM1IDEzOS4zNSAwIDAwODIuNCAzMDRDNzYuMyAzMjYuNiA3MiAzNTYuNyA2OSAzOTIuOGMtMi4yIDI2LjItMy42IDU0LTQuNCA4MS45LS4zIDkuNy0uNCAxOC44LS41IDI2LjkgMCAyLjktLjEgNS40LS4xIDcuNnY1LjZjMCAyLjIgMCA0LjcuMSA3LjYuMSA4LjEuMyAxNy4yLjUgMjYuOS44IDI3LjkgMi4yIDU1LjcgNC40IDgxLjkgMyAzNi4xIDcuNCA2Ni4yIDEzLjQgODguOCAxMi44IDQ3LjkgNTAuNCA4NS43IDk4LjMgOTguNSAyOC4yIDcuNiA4My43IDEyLjMgMTYxLjcgMTUuMiAzNy4xIDEuNCA3Ni44IDIuMyAxMTYuNSAyLjggMTMuOS4yIDI2LjguMyAzOC40LjRoMjkuNGMxMS42LS4xIDI0LjUtLjIgMzguNC0uNCAzOS43LS41IDc5LjQtMS40IDExNi41LTIuOCA3OC0zIDEzMy41LTcuNyAxNjEuNy0xNS4yIDQ3LjktMTIuOCA4NS41LTUwLjUgOTguMy05OC41IDYuMS0yMi42IDEwLjQtNTIuNyAxMy40LTg4LjggMi4yLTI2LjIgMy42LTU0IDQuNC04MS45LjMtOS43LjQtMTguOC41LTI2LjkgMC0yLjkuMS01LjQuMS03LjZ2LTUuNnptLTcyIDUuMmMwIDIuMSAwIDQuNC0uMSA3LjEtLjEgNy44LS4zIDE2LjQtLjUgMjUuNy0uNyAyNi42LTIuMSA1My4yLTQuMiA3Ny45LTIuNyAzMi4yLTYuNSA1OC42LTExLjIgNzYuMy02LjIgMjMuMS0yNC40IDQxLjQtNDcuNCA0Ny41LTIxIDUuNi03My45IDEwLjEtMTQ1LjggMTIuOC0zNi40IDEuNC03NS42IDIuMy0xMTQuNyAyLjgtMTMuNy4yLTI2LjQuMy0zNy44LjNoLTI4LjZsLTM3LjgtLjNjLTM5LjEtLjUtNzguMi0xLjQtMTE0LjctMi44LTcxLjktMi44LTEyNC45LTcuMi0xNDUuOC0xMi44LTIzLTYuMi00MS4yLTI0LjQtNDcuNC00Ny41LTQuNy0xNy43LTguNS00NC4xLTExLjItNzYuMy0yLjEtMjQuNy0zLjQtNTEuMy00LjItNzcuOS0uMy05LjMtLjQtMTgtLjUtMjUuNyAwLTIuNy0uMS01LjEtLjEtNy4xdi00LjhjMC0yLjEgMC00LjQuMS03LjEuMS03LjguMy0xNi40LjUtMjUuNy43LTI2LjYgMi4xLTUzLjIgNC4yLTc3LjkgMi43LTMyLjIgNi41LTU4LjYgMTEuMi03Ni4zIDYuMi0yMy4xIDI0LjQtNDEuNCA0Ny40LTQ3LjUgMjEtNS42IDczLjktMTAuMSAxNDUuOC0xMi44IDM2LjQtMS40IDc1LjYtMi4zIDExNC43LTIuOCAxMy43LS4yIDI2LjQtLjMgMzcuOC0uM2gyOC42bDM3LjguM2MzOS4xLjUgNzguMiAxLjQgMTE0LjcgMi44IDcxLjkgMi44IDEyNC45IDcuMiAxNDUuOCAxMi44IDIzIDYuMiA0MS4yIDI0LjQgNDcuNCA0Ny41IDQuNyAxNy43IDguNSA0NC4xIDExLjIgNzYuMyAyLjEgMjQuNyAzLjQgNTEuMyA0LjIgNzcuOS4zIDkuMy40IDE4IC41IDI1LjcgMCAyLjcuMSA1LjEuMSA3LjF2NC44ek00MjMgNjQ2bDIzMi0xMzUtMjMyLTEzM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(YoutubeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'YoutubeOutlined';
}
var _default = exports.default = RefIcon;