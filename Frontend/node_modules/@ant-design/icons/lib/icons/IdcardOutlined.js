"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IdcardOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IdcardOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IdcardOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IdcardOutlined.default
}));

/**![idcard](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAxNjBIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY0MGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTkyYzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjMySDEzNlYyMzJoNzUydjU2MHpNNjEwLjMgNDc2aDEyMy40YzEuMyAwIDIuMy0zLjYgMi4zLTh2LTQ4YzAtNC40LTEtOC0yLjMtOEg2MTAuM2MtMS4zIDAtMi4zIDMuNi0yLjMgOHY0OGMwIDQuNCAxIDggMi4zIDh6bTQuOCAxNDRoMTg1LjdjMy45IDAgNy4xLTMuNiA3LjEtOHYtNDhjMC00LjQtMy4yLTgtNy4xLThINjE1LjFjLTMuOSAwLTcuMSAzLjYtNy4xIDh2NDhjMCA0LjQgMy4yIDggNy4xIDh6TTIyNCA2NzNoNDMuOWM0LjIgMCA3LjYtMy4zIDcuOS03LjUgMy44LTUwLjUgNDYtOTAuNSA5Ny4yLTkwLjVzOTMuNCA0MCA5Ny4yIDkwLjVjLjMgNC4yIDMuNyA3LjUgNy45IDcuNUg1MjJhOCA4IDAgMDA4LTguNGMtMi44LTUzLjMtMzItOTkuNy03NC42LTEyNi4xYTExMS44IDExMS44IDAgMDAyOS4xLTc1LjVjMC02MS45LTQ5LjktMTEyLTExMS40LTExMnMtMTExLjQgNTAuMS0xMTEuNCAxMTJjMCAyOS4xIDExIDU1LjUgMjkuMSA3NS41YTE1OC4wOSAxNTguMDkgMCAwMC03NC42IDEyNi4xYy0uNCA0LjYgMy4yIDguNCA3LjggOC40em0xNDktMjYyYzI4LjUgMCA1MS43IDIzLjMgNTEuNyA1MnMtMjMuMiA1Mi01MS43IDUyLTUxLjctMjMuMy01MS43LTUyIDIzLjItNTIgNTEuNy01MnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(IdcardOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IdcardOutlined';
}
var _default = exports.default = RefIcon;