"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DiffTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DiffTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DiffTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DiffTwoTone.default
}));

/**![diff](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIzMiAyNjR2NjI0aDQzMlY0MTMuOEw1MTQuMiAyNjRIMjMyem0zMzYgNDg5YzAgMy44LTMuNCA3LTcuNSA3aC0yMjVjLTQuMSAwLTcuNS0zLjItNy41LTd2LTQyYzAtMy44IDMuNC03IDcuNS03aDIyNWM0LjEgMCA3LjUgMy4yIDcuNSA3djQyem0wLTI2MnY0MmMwIDMuOC0zLjQgNy03LjUgN0g0NzZ2ODQuOWMwIDMuOS0zLjEgNy4xLTcgNy4xaC00MmMtMy44IDAtNy0zLjItNy03LjFWNTQwaC04NC41Yy00LjEgMC03LjUtMy4yLTcuNS03di00MmMwLTMuOSAzLjQtNyA3LjUtN0g0MjB2LTg0LjljMC0zLjkgMy4yLTcuMSA3LTcuMWg0MmMzLjkgMCA3IDMuMiA3IDcuMVY0ODRoODQuNWM0LjEgMCA3LjUgMy4xIDcuNSA3eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODU0LjIgMzA2LjZMNjExLjMgNzIuOWMtNi01LjctMTMuOS04LjktMjIuMi04LjlIMjk2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDI3N2wyMTkgMjEwLjZWODI0YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LThWMzI5LjZjMC04LjctMy41LTE3LTkuOC0yM3oiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTU1My40IDIwMS40Yy02LTYtMTQuMS05LjQtMjIuNi05LjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MDRjMCAxNy43IDE0LjMgMzIgMzIgMzJoNTEyYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjM5Ny4zYzAtOC41LTMuNC0xNi42LTkuNC0yMi42TDU1My40IDIwMS40ek02NjQgODg4SDIzMlYyNjRoMjgyLjJMNjY0IDQxMy44Vjg4OHoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTQ3NiAzOTkuMWMwLTMuOS0zLjEtNy4xLTctNy4xaC00MmMtMy44IDAtNyAzLjItNyA3LjFWNDg0aC04NC41Yy00LjEgMC03LjUgMy4xLTcuNSA3djQyYzAgMy44IDMuNCA3IDcuNSA3SDQyMHY4NC45YzAgMy45IDMuMiA3LjEgNyA3LjFoNDJjMy45IDAgNy0zLjIgNy03LjFWNTQwaDg0LjVjNC4xIDAgNy41LTMuMiA3LjUtN3YtNDJjMC0zLjktMy40LTctNy41LTdINDc2di04NC45ek01NjAuNSA3MDRoLTIyNWMtNC4xIDAtNy41IDMuMi03LjUgN3Y0MmMwIDMuOCAzLjQgNyA3LjUgN2gyMjVjNC4xIDAgNy41LTMuMiA3LjUtN3YtNDJjMC0zLjgtMy40LTctNy41LTd6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(DiffTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DiffTwoTone';
}
var _default = exports.default = RefIcon;