"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BellOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BellOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BellOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BellOutlined.default
}));

/**![bell](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgxNiA3NjhoLTI0VjQyOGMwLTE0MS4xLTEwNC4zLTI1Ny43LTI0MC0yNzcuMVYxMTJjMC0yMi4xLTE3LjktNDAtNDAtNDBzLTQwIDE3LjktNDAgNDB2MzguOWMtMTM1LjcgMTkuNC0yNDAgMTM2LTI0MCAyNzcuMXYzNDBoLTI0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnYzMmMwIDQuNCAzLjYgOCA4IDhoMjE2YzAgNjEuOCA1MC4yIDExMiAxMTIgMTEyczExMi01MC4yIDExMi0xMTJoMjE2YzQuNCAwIDgtMy42IDgtOHYtMzJjMC0xNy43LTE0LjMtMzItMzItMzJ6TTUxMiA4ODhjLTI2LjUgMC00OC0yMS41LTQ4LTQ4aDk2YzAgMjYuNS0yMS41IDQ4LTQ4IDQ4ek0zMDQgNzY4VjQyOGMwLTU1LjYgMjEuNi0xMDcuOCA2MC45LTE0Ny4xUzQ1Ni40IDIyMCA1MTIgMjIwYzU1LjYgMCAxMDcuOCAyMS42IDE0Ny4xIDYwLjlTNzIwIDM3Mi40IDcyMCA0Mjh2MzQwSDMwNHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(BellOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BellOutlined';
}
var _default = exports.default = RefIcon;