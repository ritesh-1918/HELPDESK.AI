"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloseSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CloseSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CloseSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CloseSquareFilled.default
}));

/**![close-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODgwIDExMmMxNy43IDAgMzIgMTQuMyAzMiAzMnY3MzZjMCAxNy43LTE0LjMgMzItMzIgMzJIMTQ0Yy0xNy43IDAtMzItMTQuMy0zMi0zMlYxNDRjMC0xNy43IDE0LjMtMzIgMzItMzJ6TTYzOS45OCAzMzguODJoLS4wNGwtLjA4LjA2TDUxMiA0NjYuNzUgMzg0LjE0IDMzOC44OGMtLjA0LS4wNS0uMDYtLjA2LS4wOC0uMDZhLjEyLjEyIDAgMDAtLjA3IDBjLS4wMyAwLS4wNS4wMS0uMDkuMDVsLTQ1LjAyIDQ1LjAyYS4yLjIgMCAwMC0uMDUuMDkuMTIuMTIgMCAwMDAgLjA3di4wMmEuMjcuMjcgMCAwMC4wNi4wNkw0NjYuNzUgNTEyIDMzOC44OCA2MzkuODZjLS4wNS4wNC0uMDYuMDYtLjA2LjA4YS4xMi4xMiAwIDAwMCAuMDdjMCAuMDMuMDEuMDUuMDUuMDlsNDUuMDIgNDUuMDJhLjIuMiAwIDAwLjA5LjA1LjEyLjEyIDAgMDAuMDcgMGMuMDIgMCAuMDQtLjAxLjA4LS4wNUw1MTIgNTU3LjI1bDEyNy44NiAxMjcuODdjLjA0LjA0LjA2LjA1LjA4LjA1YS4xMi4xMiAwIDAwLjA3IDBjLjAzIDAgLjA1LS4wMS4wOS0uMDVsNDUuMDItNDUuMDJhLjIuMiAwIDAwLjA1LS4wOS4xMi4xMiAwIDAwMC0uMDd2LS4wMmEuMjcuMjcgMCAwMC0uMDUtLjA2TDU1Ny4yNSA1MTJsMTI3Ljg3LTEyNy44NmMuMDQtLjA0LjA1LS4wNi4wNS0uMDhhLjEyLjEyIDAgMDAwLS4wN2MwLS4wMy0uMDEtLjA1LS4wNS0uMDlsLTQ1LjAyLTQ1LjAyYS4yLjIgMCAwMC0uMDktLjA1LjEyLjEyIDAgMDAtLjA3IDB6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CloseSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CloseSquareFilled';
}
var _default = exports.default = RefIcon;