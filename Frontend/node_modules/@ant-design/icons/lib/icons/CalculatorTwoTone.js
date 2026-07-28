"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CalculatorTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CalculatorTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CalculatorTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CalculatorTwoTone.default
}));

/**![calculator](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQwIDcyOEgxODRWMTg0aDY1NnY2NTZ6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik0xODQgODQwaDY1NlYxODRIMTg0djY1NnptMjU2LjItNzVoLTUwLjhjLTIuMiAwLTQuNS0xLjEtNS45LTIuOUwzNDggNzE4LjZsLTM1LjUgNDMuNWE3LjM4IDcuMzggMCAwMS01LjkgMi45aC01MC44Yy02LjYgMC0xMC4yLTcuOS01LjgtMTMuMWw2Mi43LTc2LjgtNjEuMi03NC45Yy00LjMtNS4yLS43LTEzLjEgNS45LTEzLjFoNTAuOWMyLjIgMCA0LjUgMS4xIDUuOSAyLjlsMzQgNDEuNiAzNC00MS42YzEuNS0xLjkgMy42LTIuOSA1LjktMi45aDUwLjhjNi42IDAgMTAuMiA3LjkgNS45IDEzLjFMMzgzLjUgNjc1bDYyLjcgNzYuOGM0LjIgNS4zLjYgMTMuMi02IDEzLjJ6TTU3NiAzMzVjMC0yLjIgMS40LTQgMy4yLTRoMTkzLjVjMS45IDAgMy4zIDEuOCAzLjMgNHY0OGMwIDIuMi0xLjQgNC0zLjIgNEg1NzkuMmMtMS44IDAtMy4yLTEuOC0zLjItNHYtNDh6bTAgMjY1YzAtMi4yIDEuNC00IDMuMi00aDE5My41YzEuOSAwIDMuMyAxLjggMy4zIDR2NDhjMCAyLjItMS40IDQtMy4yIDRINTc5LjJjLTEuOCAwLTMuMi0xLjgtMy4yLTR2LTQ4em0wIDEwNGMwLTIuMiAxLjQtNCAzLjItNGgxOTMuNWMxLjkgMCAzLjMgMS44IDMuMyA0djQ4YzAgMi4yLTEuNCA0LTMuMiA0SDU3OS4yYy0xLjggMC0zLjItMS44LTMuMi00di00OHpNMjQ4IDMzNWMwLTIuMiAxLjQtNCAzLjItNEgzMjB2LTY4LjhjMC0xLjggMS44LTMuMiA0LTMuMmg0OGMyLjIgMCA0IDEuNCA0IDMuMlYzMzFoNjguN2MxLjkgMCAzLjMgMS44IDMuMyA0djQ4YzAgMi4yLTEuNCA0LTMuMiA0SDM3NnY2OC43YzAgMS45LTEuOCAzLjMtNCAzLjNoLTQ4Yy0yLjIgMC00LTEuNC00LTMuMlYzODdoLTY4LjhjLTEuOCAwLTMuMi0xLjgtMy4yLTR2LTQ4eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNMzgzLjUgNjc1bDYxLjMtNzQuOGM0LjMtNS4yLjctMTMuMS01LjktMTMuMWgtNTAuOGMtMi4zIDAtNC40IDEtNS45IDIuOWwtMzQgNDEuNi0zNC00MS42YTcuNjkgNy42OSAwIDAwLTUuOS0yLjloLTUwLjljLTYuNiAwLTEwLjIgNy45LTUuOSAxMy4xbDYxLjIgNzQuOS02Mi43IDc2LjhjLTQuNCA1LjItLjggMTMuMSA1LjggMTMuMWg1MC44YzIuMyAwIDQuNC0xIDUuOS0yLjlsMzUuNS00My41IDM1LjUgNDMuNWMxLjQgMS44IDMuNyAyLjkgNS45IDIuOWg1MC44YzYuNiAwIDEwLjItNy45IDYtMTMuMkwzODMuNSA2NzV6TTI1MS4yIDM4N0gzMjB2NjguOGMwIDEuOCAxLjggMy4yIDQgMy4yaDQ4YzIuMiAwIDQtMS40IDQtMy4zVjM4N2g2OC44YzEuOCAwIDMuMi0xLjggMy4yLTR2LTQ4YzAtMi4yLTEuNC00LTMuMy00SDM3NnYtNjguOGMwLTEuOC0xLjgtMy4yLTQtMy4yaC00OGMtMi4yIDAtNCAxLjQtNCAzLjJWMzMxaC02OC44Yy0xLjggMC0zLjIgMS44LTMuMiA0djQ4YzAgMi4yIDEuNCA0IDMuMiA0em0zMjggMzY5aDE5My42YzEuOCAwIDMuMi0xLjggMy4yLTR2LTQ4YzAtMi4yLTEuNC00LTMuMy00SDU3OS4yYy0xLjggMC0zLjIgMS44LTMuMiA0djQ4YzAgMi4yIDEuNCA0IDMuMiA0em0wLTEwNGgxOTMuNmMxLjggMCAzLjItMS44IDMuMi00di00OGMwLTIuMi0xLjQtNC0zLjMtNEg1NzkuMmMtMS44IDAtMy4yIDEuOC0zLjIgNHY0OGMwIDIuMiAxLjQgNCAzLjIgNHptMC0yNjVoMTkzLjZjMS44IDAgMy4yLTEuOCAzLjItNHYtNDhjMC0yLjItMS40LTQtMy4zLTRINTc5LjJjLTEuOCAwLTMuMiAxLjgtMy4yIDR2NDhjMCAyLjIgMS40IDQgMy4yIDR6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CalculatorTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CalculatorTwoTone';
}
var _default = exports.default = RefIcon;