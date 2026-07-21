"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CalculatorFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CalculatorFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CalculatorFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CalculatorFilled.default
}));

/**![calculator](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNDQwLjIgNzY1aC01MC44Yy0yLjIgMC00LjUtMS4xLTUuOS0yLjlMMzQ4IDcxOC42bC0zNS41IDQzLjVhNy4zOCA3LjM4IDAgMDEtNS45IDIuOWgtNTAuOGMtNi42IDAtMTAuMi03LjktNS44LTEzLjFsNjIuNy03Ni44LTYxLjItNzQuOWMtNC4zLTUuMi0uNy0xMy4xIDUuOS0xMy4xaDUwLjljMi4yIDAgNC41IDEuMSA1LjkgMi45bDM0IDQxLjYgMzQtNDEuNmMxLjUtMS45IDMuNi0yLjkgNS45LTIuOWg1MC44YzYuNiAwIDEwLjIgNy45IDUuOSAxMy4xTDM4My41IDY3NWw2Mi43IDc2LjhjNC4yIDUuMy42IDEzLjItNiAxMy4yem03LjgtMzgyYzAgMi4yLTEuNCA0LTMuMiA0SDM3NnY2OC43YzAgMS45LTEuOCAzLjMtNCAzLjNoLTQ4Yy0yLjIgMC00LTEuNC00LTMuMlYzODdoLTY4LjhjLTEuOCAwLTMuMi0xLjgtMy4yLTR2LTQ4YzAtMi4yIDEuNC00IDMuMi00SDMyMHYtNjguOGMwLTEuOCAxLjgtMy4yIDQtMy4yaDQ4YzIuMiAwIDQgMS40IDQgMy4yVjMzMWg2OC43YzEuOSAwIDMuMyAxLjggMy4zIDR2NDh6bTMyOCAzNjljMCAyLjItMS40IDQtMy4yIDRINTc5LjJjLTEuOCAwLTMuMi0xLjgtMy4yLTR2LTQ4YzAtMi4yIDEuNC00IDMuMi00aDE5My41YzEuOSAwIDMuMyAxLjggMy4zIDR2NDh6bTAtMTA0YzAgMi4yLTEuNCA0LTMuMiA0SDU3OS4yYy0xLjggMC0zLjItMS44LTMuMi00di00OGMwLTIuMiAxLjQtNCAzLjItNGgxOTMuNWMxLjkgMCAzLjMgMS44IDMuMyA0djQ4em0wLTI2NWMwIDIuMi0xLjQgNC0zLjIgNEg1NzkuMmMtMS44IDAtMy4yLTEuOC0zLjItNHYtNDhjMC0yLjIgMS40LTQgMy4yLTRoMTkzLjVjMS45IDAgMy4zIDEuOCAzLjMgNHY0OHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CalculatorFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CalculatorFilled';
}
var _default = exports.default = RefIcon;