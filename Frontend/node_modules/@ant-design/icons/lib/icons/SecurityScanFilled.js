"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SecurityScanFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SecurityScanFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SecurityScanFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SecurityScanFilled.default
}));

/**![security-scan](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2Ni45IDE2OS45TDUyNy4xIDU0LjFDNTIzIDUyLjcgNTE3LjUgNTIgNTEyIDUycy0xMSAuNy0xNS4xIDIuMUwxNTcuMSAxNjkuOWMtOC4zIDIuOC0xNS4xIDEyLjQtMTUuMSAyMS4ydjQ4Mi40YzAgOC44IDUuNyAyMC40IDEyLjYgMjUuOUw0OTkuMyA5NjhjMy41IDIuNyA4IDQuMSAxMi42IDQuMXM5LjItMS40IDEyLjYtNC4xbDM0NC43LTI2OC42YzYuOS01LjQgMTIuNi0xNyAxMi42LTI1LjlWMTkxLjFjLjItOC44LTYuNi0xOC4zLTE0LjktMjEuMnpNNjI2LjggNTU0Yy00OC41IDQ4LjUtMTIzIDU1LjItMTc4LjYgMjAuMWwtNzcuNSA3Ny41YTguMDMgOC4wMyAwIDAxLTExLjMgMGwtMzQtMzRhOC4wMyA4LjAzIDAgMDEwLTExLjNsNzcuNS03Ny41Yy0zNS4xLTU1LjctMjguNC0xMzAuMSAyMC4xLTE3OC42IDU2LjMtNTYuMyAxNDcuNS01Ni4zIDIwMy44IDAgNTYuMyA1Ni4zIDU2LjMgMTQ3LjUgMCAyMDMuOHptLTE1OC41NC00NS4yN2E4MC4xIDgwLjEgMCAxMDExMy4yNy0xMTMuMjggODAuMSA4MC4xIDAgMTAtMTEzLjI3IDExMy4yOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(SecurityScanFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SecurityScanFilled';
}
var _default = exports.default = RefIcon;