"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileJpgOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileJpgOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileJpgOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileJpgOutlined.default
}));

/**![file-jpg](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3NC42IDMwMS44TDU5Ni44IDIxLjNjLTQuNS00LjUtOS40LTguMy0xNC43LTExLjUtMS40LS44LTIuOC0xLjYtNC4zLTIuMy0uOS0uNS0xLjktLjktMi44LTEuMy05LTQtMTguOS02LjItMjktNi4ySDIwMWMtMzkuOCAwLTczIDMyLjItNzMgNzJ2ODgwYzAgMzkuOCAzMy4yIDcyIDczIDcyaDYyM2MzOS44IDAgNzEtMzIuMiA3MS03MlYzNTIuNWMwLTE5LTctMzcuMi0yMC40LTUwLjd6TTU4MyAxMTAuNEw3ODMuOCAzMTJINTgzVjExMC40ek04MjMgOTUySDIwMFY3MmgzMTF2MjQwYzAgMzkuOCAzMy4yIDcyIDczIDcyaDIzOXY1Njh6TTM1MCA2OTYuNWMwIDI0LjItNy41IDMxLjQtMjEuOSAzMS40LTkgMC0xOC40LTUuOC0yNC44LTE4LjVMMjcyLjkgNzMyYzEzLjQgMjIuOSAzMi4zIDM0LjIgNjEuMyAzNC4yIDQxLjYgMCA2MC44LTI5LjkgNjAuOC02Ni4yVjU3N2gtNDV2MTE5LjV6TTUwMS4zIDU3N0g0Mzd2MTg2aDQ0di02MmgyMS42YzM5LjEgMCA3My4xLTE5LjYgNzMuMS02My42IDAtNDUuOC0zMy41LTYwLjQtNzQuNC02MC40em0tLjggODlINDgxdi01M2gxOC4yYzIxLjUgMCAzMy40IDYuMiAzMy40IDI0LjkgMCAxOC4xLTEwLjUgMjguMS0zMi4xIDI4LjF6bTE4Mi41LTl2MzZoMzB2MzAuMWMtNCAyLjktMTEgNC43LTE3LjcgNC43LTM0LjMgMC01MC43LTIxLjQtNTAuNy01OC4yIDAtMzYuMSAxOS43LTU3LjQgNDcuMS01Ny40IDE1LjMgMCAyNSA2LjIgMzQgMTQuNGwyMy43LTI4LjNjLTEyLjctMTIuOC0zMi4xLTI0LjItNTkuMi0yNC4yLTQ5LjYgMC05MS4xIDM1LjMtOTEuMSA5NyAwIDYyLjcgNDAgOTUuMSA5MS41IDk1LjEgMjUuOSAwIDQ5LjItMTAuMiA2MS41LTIyLjZWNjU3SDY4M3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileJpgOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileJpgOutlined';
}
var _default = exports.default = RefIcon;