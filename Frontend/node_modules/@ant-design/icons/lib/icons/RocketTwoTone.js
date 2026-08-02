"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RocketTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RocketTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RocketTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RocketTwoTone.default
}));

/**![rocket](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI2MS43IDYyMS40Yy05LjQgMTQuNi0xNyAzMC4zLTIyLjUgNDYuNkgzMjRWNTU4LjdjLTI0LjggMTYuMi00NiAzNy41LTYyLjMgNjIuN3pNNzAwIDU1OC43VjY2OGg4NC44Yy01LjUtMTYuMy0xMy4xLTMyLTIyLjUtNDYuNmEyMTEuNiAyMTEuNiAwIDAwLTYyLjMtNjIuN3ptLTY0LTIzOS45bC0xMjQtMTQ3LTEyNCAxNDdWNjY4aDI0OFYzMTguOHpNNTEyIDQ0OGE0OC4wMSA0OC4wMSAwIDAxMC05NiA0OC4wMSA0OC4wMSAwIDAxMCA5NnoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTg2NCA3MzZjMC0xMTEuNi02NS40LTIwOC0xNjAtMjUyLjlWMzE3LjNjMC0xNS4xLTUuMy0yOS43LTE1LjEtNDEuMkw1MzYuNSA5NS40QzUzMC4xIDg3LjggNTIxIDg0IDUxMiA4NHMtMTguMSAzLjgtMjQuNSAxMS40TDMzNS4xIDI3Ni4xYTYzLjk3IDYzLjk3IDAgMDAtMTUuMSA0MS4ydjE2NS44QzIyNS40IDUyOCAxNjAgNjI0LjQgMTYwIDczNmgxNTYuNWMtMi4zIDcuMi0zLjUgMTUtMy41IDIzLjggMCAyMi4xIDcuNiA0My43IDIxLjQgNjAuOGE5Ny4yIDk3LjIgMCAwMDQzLjEgMzAuNmMyMy4xIDU0IDc1LjYgODguOCAxMzQuNSA4OC44IDI5LjEgMCA1Ny4zLTguNiA4MS40LTI0LjggMjMuNi0xNS44IDQxLjktMzcuOSA1My02NGE5NyA5NyAwIDAwNDMuMS0zMC41IDk3LjUyIDk3LjUyIDAgMDAyMS40LTYwLjhjMC04LjQtMS4xLTE2LjQtMy4xLTIzLjhMODY0IDczNnptLTU0MC02OGgtODQuOGM1LjUtMTYuMyAxMy4xLTMyIDIyLjUtNDYuNiAxNi4zLTI1LjIgMzcuNS00Ni41IDYyLjMtNjIuN1Y2Njh6bTY0LTE4NC45VjMxOC44bDEyNC0xNDcgMTI0IDE0N1Y2NjhIMzg4VjQ4My4xem0yNDAuMSAzMDEuMWMtNS4yIDMtMTEuMiA0LjItMTcuMSAzLjRsLTE5LjUtMi40LTIuOCAxOS40Yy01LjQgMzcuOS0zOC40IDY2LjUtNzYuNyA2Ni41cy03MS4zLTI4LjYtNzYuNy02Ni41bC0yLjgtMTkuNS0xOS41IDIuNWEyNy43IDI3LjcgMCAwMS0xNy4xLTMuNWMtOC43LTUtMTQuMS0xNC4zLTE0LjEtMjQuNCAwLTEwLjYgNS45LTE5LjQgMTQuNi0yMy44aDIzMS4zYzguOCA0LjUgMTQuNiAxMy4zIDE0LjYgMjMuOC0uMSAxMC4yLTUuNSAxOS42LTE0LjIgMjQuNXpNNzAwIDY2OFY1NTguN2EyMTEuNiAyMTEuNiAwIDAxNjIuMyA2Mi43YzkuNCAxNC42IDE3IDMwLjMgMjIuNSA0Ni42SDcwMHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTQ2NCA0MDBhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAweiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(RocketTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RocketTwoTone';
}
var _default = exports.default = RefIcon;