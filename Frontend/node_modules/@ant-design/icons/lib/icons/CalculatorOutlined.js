"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CalculatorOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CalculatorOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CalculatorOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CalculatorOutlined.default
}));

/**![calculator](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI1MS4yIDM4N0gzMjB2NjguOGMwIDEuOCAxLjggMy4yIDQgMy4yaDQ4YzIuMiAwIDQtMS40IDQtMy4zVjM4N2g2OC44YzEuOCAwIDMuMi0xLjggMy4yLTR2LTQ4YzAtMi4yLTEuNC00LTMuMy00SDM3NnYtNjguOGMwLTEuOC0xLjgtMy4yLTQtMy4yaC00OGMtMi4yIDAtNCAxLjQtNCAzLjJWMzMxaC02OC44Yy0xLjggMC0zLjIgMS44LTMuMiA0djQ4YzAgMi4yIDEuNCA0IDMuMiA0em0zMjggMGgxOTMuNmMxLjggMCAzLjItMS44IDMuMi00di00OGMwLTIuMi0xLjQtNC0zLjMtNEg1NzkuMmMtMS44IDAtMy4yIDEuOC0zLjIgNHY0OGMwIDIuMiAxLjQgNCAzLjIgNHptMCAyNjVoMTkzLjZjMS44IDAgMy4yLTEuOCAzLjItNHYtNDhjMC0yLjItMS40LTQtMy4zLTRINTc5LjJjLTEuOCAwLTMuMiAxLjgtMy4yIDR2NDhjMCAyLjIgMS40IDQgMy4yIDR6bTAgMTA0aDE5My42YzEuOCAwIDMuMi0xLjggMy4yLTR2LTQ4YzAtMi4yLTEuNC00LTMuMy00SDU3OS4yYy0xLjggMC0zLjIgMS44LTMuMiA0djQ4YzAgMi4yIDEuNCA0IDMuMiA0em0tMTk1LjctODFsNjEuMi03NC45YzQuMy01LjIuNy0xMy4xLTUuOS0xMy4xSDM4OGMtMi4zIDAtNC41IDEtNS45IDIuOWwtMzQgNDEuNi0zNC00MS42YTcuODUgNy44NSAwIDAwLTUuOS0yLjloLTUwLjljLTYuNiAwLTEwLjIgNy45LTUuOSAxMy4xbDYxLjIgNzQuOS02Mi43IDc2LjhjLTQuNCA1LjItLjggMTMuMSA1LjggMTMuMWg1MC44YzIuMyAwIDQuNS0xIDUuOS0yLjlsMzUuNS00My41IDM1LjUgNDMuNWMxLjUgMS44IDMuNyAyLjkgNS45IDIuOWg1MC44YzYuNiAwIDEwLjItNy45IDUuOS0xMy4xTDM4My41IDY3NXpNODgwIDExMkgxNDRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjczNmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg3MzZjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTQ0YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tMzYgNzMySDE4MFYxODBoNjY0djY2NHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CalculatorOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CalculatorOutlined';
}
var _default = exports.default = RefIcon;