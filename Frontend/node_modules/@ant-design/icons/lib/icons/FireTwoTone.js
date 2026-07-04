"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FireTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FireTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FireTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FireTwoTone.default
}));

/**![fire](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTczNyA0MzguNmMtOS42IDE1LjUtMjEuMSAzMC43LTM0LjQgNDUuNmE3My4xIDczLjEgMCAwMS01MSAyNC40IDczLjM2IDczLjM2IDAgMDEtNTMuNC0xOC44IDc0LjAxIDc0LjAxIDAgMDEtMjQuNC01OS44YzMtNDcuNC0xMi40LTEwMy4xLTQ1LjgtMTY1LjctMTYuOS0zMS40LTM3LjEtNTguMi02MS4yLTgwLjRhMjQwIDI0MCAwIDAxLTEyLjEgNDYuNSAzNTQuMjYgMzU0LjI2IDAgMDEtNTguMiAxMDEgMzQ5LjYgMzQ5LjYgMCAwMS01OC42IDU2LjhjLTM0IDI2LjEtNjIgNjAtODAuOCA5Ny45YTI3NS45NiAyNzUuOTYgMCAwMC0yOS4xIDEyNGMwIDc0LjkgMjkuNSAxNDUuMyA4MyAxOTguNCA1My43IDUzLjIgMTI1IDgyLjQgMjAxIDgyLjRzMTQ3LjMtMjkuMiAyMDEtODIuNGM1My41LTUzIDgzLTEyMy41IDgzLTE5OC40IDAtMzkuMi04LjEtNzcuMy0yNC0xMTMuMS05LjMtMjEtMjEtNDAuNS0zNS01OC40eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODM0LjEgNDY5LjJBMzQ3LjQ5IDM0Ny40OSAwIDAwNzUxLjIgMzU0bC0yOS4xLTI2LjdhOC4wOSA4LjA5IDAgMDAtMTMgMy4zbC0xMyAzNy4zYy04LjEgMjMuNC0yMyA0Ny4zLTQ0LjEgNzAuOC0xLjQgMS41LTMgMS45LTQuMSAyLTEuMS4xLTIuOC0uMS00LjMtMS41LTEuNC0xLjItMi4xLTMtMi00LjggMy43LTYwLjItMTQuMy0xMjguMS01My43LTIwMkM1NTUuMyAxNzEgNTEwIDEyMy4xIDQ1My40IDg5LjdsLTQxLjMtMjQuM2MtNS40LTMuMi0xMi4zIDEtMTIgNy4zbDIuMiA0OGMxLjUgMzIuOC0yLjMgNjEuOC0xMS4zIDg1LjktMTEgMjkuNS0yNi44IDU2LjktNDcgODEuNWEyOTUuNjQgMjk1LjY0IDAgMDEtNDcuNSA0Ni4xIDM1Mi42IDM1Mi42IDAgMDAtMTAwLjMgMTIxLjVBMzQ3Ljc1IDM0Ny43NSAwIDAwMTYwIDYxMGMwIDQ3LjIgOS4zIDkyLjkgMjcuNyAxMzZhMzQ5LjQgMzQ5LjQgMCAwMDc1LjUgMTEwLjljMzIuNCAzMiA3MCA1Ny4yIDExMS45IDc0LjdDNDE4LjUgOTQ5LjggNDY0LjUgOTU5IDUxMiA5NTlzOTMuNS05LjIgMTM2LjktMjcuM0EzNDguNiAzNDguNiAwIDAwNzYwLjggODU3YzMyLjQtMzIgNTcuOC02OS40IDc1LjUtMTEwLjlhMzQ0LjIgMzQ0LjIgMCAwMDI3LjctMTM2YzAtNDguOC0xMC05Ni4yLTI5LjktMTQwLjl6TTcxMyA4MDguNWMtNTMuNyA1My4yLTEyNSA4Mi40LTIwMSA4Mi40cy0xNDcuMy0yOS4yLTIwMS04Mi40Yy01My41LTUzLjEtODMtMTIzLjUtODMtMTk4LjQgMC00My41IDkuOC04NS4yIDI5LjEtMTI0IDE4LjgtMzcuOSA0Ni44LTcxLjggODAuOC05Ny45YTM0OS42IDM0OS42IDAgMDA1OC42LTU2LjhjMjUtMzAuNSA0NC42LTY0LjUgNTguMi0xMDFhMjQwIDI0MCAwIDAwMTIuMS00Ni41YzI0LjEgMjIuMiA0NC4zIDQ5IDYxLjIgODAuNCAzMy40IDYyLjYgNDguOCAxMTguMyA0NS44IDE2NS43YTc0LjAxIDc0LjAxIDAgMDAyNC40IDU5LjggNzMuMzYgNzMuMzYgMCAwMDUzLjQgMTguOGMxOS43LTEgMzcuOC05LjcgNTEtMjQuNCAxMy4zLTE0LjkgMjQuOC0zMC4xIDM0LjQtNDUuNiAxNCAxNy45IDI1LjcgMzcuNCAzNSA1OC40IDE1LjkgMzUuOCAyNCA3My45IDI0IDExMy4xIDAgNzQuOS0yOS41IDE0NS40LTgzIDE5OC40eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FireTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FireTwoTone';
}
var _default = exports.default = RefIcon;