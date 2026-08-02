"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PhoneOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PhoneOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PhoneOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PhoneOutlined.default
}));

/**![phone](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3Ny4xIDIzOC43TDc3MC42IDEzMi4zYy0xMy0xMy0zMC40LTIwLjMtNDguOC0yMC4zcy0zNS44IDcuMi00OC44IDIwLjNMNTU4LjMgMjQ2LjhjLTEzIDEzLTIwLjMgMzAuNS0yMC4zIDQ4LjkgMCAxOC41IDcuMiAzNS44IDIwLjMgNDguOWw4OS42IDg5LjdhNDA1LjQ2IDQwNS40NiAwIDAxLTg2LjQgMTI3LjNjLTM2LjcgMzYuOS03OS42IDY2LTEyNy4yIDg2LjZsLTg5LjYtODkuN2MtMTMtMTMtMzAuNC0yMC4zLTQ4LjgtMjAuM2E2OC4yIDY4LjIgMCAwMC00OC44IDIwLjNMMTMyLjMgNjczYy0xMyAxMy0yMC4zIDMwLjUtMjAuMyA0OC45IDAgMTguNSA3LjIgMzUuOCAyMC4zIDQ4LjlsMTA2LjQgMTA2LjRjMjIuMiAyMi4yIDUyLjggMzQuOSA4NC4yIDM0LjkgNi41IDAgMTIuOC0uNSAxOS4yLTEuNiAxMzIuNC0yMS44IDI2My44LTkyLjMgMzY5LjktMTk4LjNDODE4IDYwNiA4ODguNCA0NzQuNiA5MTAuNCAzNDIuMWM2LjMtMzcuNi02LjMtNzYuMy0zMy4zLTEwMy40em0tMzcuNiA5MS41Yy0xOS41IDExNy45LTgyLjkgMjM1LjUtMTc4LjQgMzMxcy0yMTMgMTU4LjktMzMwLjkgMTc4LjRjLTE0LjggMi41LTMwLTIuNS00MC44LTEzLjJMMTg0LjkgNzIxLjkgMjk1LjcgNjExbDExOS44IDEyMCAuOS45IDIxLjYtOGE0ODEuMjkgNDgxLjI5IDAgMDAyODUuNy0yODUuOGw4LTIxLjYtMTIwLjgtMTIwLjcgMTEwLjgtMTEwLjkgMTA0LjUgMTA0LjVjMTAuOCAxMC44IDE1LjggMjYgMTMuMyA0MC44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PhoneOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PhoneOutlined';
}
var _default = exports.default = RefIcon;