"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloseSquareOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CloseSquareOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CloseSquareOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CloseSquareOutlined.default
}));

/**![close-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODgwIDExMmMxNy43IDAgMzIgMTQuMyAzMiAzMnY3MzZjMCAxNy43LTE0LjMgMzItMzIgMzJIMTQ0Yy0xNy43IDAtMzItMTQuMy0zMi0zMlYxNDRjMC0xNy43IDE0LjMtMzIgMzItMzJ6bS00MCA3MkgxODR2NjU2aDY1NlYxODR6TTY0MC4wMSAzMzguODNjLjAzIDAgLjA1LjAxLjA5LjA2bDQ1LjAyIDQ1LjAxYS4yLjIgMCAwMS4wNS4wOS4xMi4xMiAwIDAxMCAuMDdjMCAuMDItLjAxLjA0LS4wNS4wOEw1NTcuMjUgNTEybDEyNy44NyAxMjcuODZhLjI3LjI3IDAgMDEuMDUuMDZ2LjAyYS4xMi4xMiAwIDAxMCAuMDdjMCAuMDMtLjAxLjA1LS4wNS4wOWwtNDUuMDIgNDUuMDJhLjIuMiAwIDAxLS4wOS4wNS4xMi4xMiAwIDAxLS4wNyAwYy0uMDIgMC0uMDQtLjAxLS4wOC0uMDVMNTEyIDU1Ny4yNSAzODQuMTQgNjg1LjEyYy0uMDQuMDQtLjA2LjA1LS4wOC4wNWEuMTIuMTIgMCAwMS0uMDcgMGMtLjAzIDAtLjA1LS4wMS0uMDktLjA1bC00NS4wMi00NS4wMmEuMi4yIDAgMDEtLjA1LS4wOS4xMi4xMiAwIDAxMC0uMDdjMC0uMDIuMDEtLjA0LjA2LS4wOEw0NjYuNzUgNTEyIDMzOC44OCAzODQuMTRhLjI3LjI3IDAgMDEtLjA1LS4wNmwtLjAxLS4wMmEuMTIuMTIgMCAwMTAtLjA3YzAtLjAzLjAxLS4wNS4wNS0uMDlsNDUuMDItNDUuMDJhLjIuMiAwIDAxLjA5LS4wNS4xMi4xMiAwIDAxLjA3IDBjLjAyIDAgLjA0LjAxLjA4LjA2TDUxMiA0NjYuNzVsMTI3Ljg2LTEyNy44NmMuMDQtLjA1LjA2LS4wNi4wOC0uMDZhLjEyLjEyIDAgMDEuMDcgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CloseSquareOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CloseSquareOutlined';
}
var _default = exports.default = RefIcon;