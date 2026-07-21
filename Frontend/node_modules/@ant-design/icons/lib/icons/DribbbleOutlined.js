"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DribbbleOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DribbbleOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DribbbleOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DribbbleOutlined.default
}));

/**![dribbble](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA5NkMyODIuNiA5NiA5NiAyODIuNiA5NiA1MTJzMTg2LjYgNDE2IDQxNiA0MTYgNDE2LTE4Ni42IDQxNi00MTZTNzQxLjQgOTYgNTEyIDk2em0yNzUuMSAxOTEuOGM0OS41IDYwLjUgNzkuNSAxMzcuNSA4MC4yIDIyMS40LTExLjctMi41LTEyOS4yLTI2LjMtMjQ3LjQtMTEuNC0yLjUtNi4xLTUtMTIuMi03LjYtMTguMy03LjQtMTcuMy0xNS4zLTM0LjYtMjMuNi01MS41QzcyMCAzNzQuMyA3NzkuNiAyOTggNzg3LjEgMjg3Ljh6TTUxMiAxNTcuMmM5MC4zIDAgMTcyLjggMzMuOSAyMzUuNSA4OS41LTYuNCA5LjEtNTkuOSA4MS0xODYuMiAxMjguNC01OC4yLTEwNy0xMjIuNy0xOTQuOC0xMzIuNi0yMDggMjcuMy02LjYgNTUuMi05LjkgODMuMy05Ljl6TTM2MC45IDE5MWM5LjQgMTIuOCA3Mi45IDEwMC45IDEzMS43IDIwNS41QzMyNi40IDQ0MC42IDE4MCA0NDAgMTY0LjEgNDM5LjhjMjMuMS0xMTAuMyA5Ny40LTIwMS45IDE5Ni44LTI0OC44ek0xNTYuNyA1MTIuNWMwLTMuNi4xLTcuMy4yLTEwLjkgMTUuNS4zIDE4Ny43IDIuNSAzNjUuMi01MC42IDEwLjIgMTkuOSAxOS45IDQwLjEgMjguOCA2MC4zLTQuNyAxLjMtOS40IDIuNy0xNCA0LjJDMzUzLjYgNTc0LjkgMjU2LjEgNzM2LjQgMjQ4IDc1MC4xYy01Ni43LTYzLTkxLjMtMTQ2LjMtOTEuMy0yMzcuNnpNNTEyIDg2Ny44Yy04Mi4yIDAtMTU3LjktMjgtMjE4LjEtNzUgNi40LTEzLjEgNzguMy0xNTIgMjc4LjctMjIxLjlsMi4zLS44YzQ5LjkgMTI5LjYgNzAuNSAyMzguMyA3NS44IDI2OS41QTM1MC40NiAzNTAuNDYgMCAwMTUxMiA4NjcuOHptMTk4LjUtNjAuN2MtMy42LTIxLjYtMjIuNS0xMjUuNi02OS0yNTMuM0M3NTIuOSA1MzYgODUwLjcgNTY1LjIgODYyLjggNTY5Yy0xNS44IDk4LjgtNzIuNSAxODQuMi0xNTIuMyAyMzguMXoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DribbbleOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DribbbleOutlined';
}
var _default = exports.default = RefIcon;