"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LoginOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LoginOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LoginOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LoginOutlined.default
}));

/**![login](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik01MjEuNyA4MmMtMTUyLjUtLjQtMjg2LjcgNzguNS0zNjMuNCAxOTcuNy0zLjQgNS4zLjQgMTIuMyA2LjcgMTIuM2g3MC4zYzQuOCAwIDkuMy0yLjEgMTIuMy01LjggNy04LjUgMTQuNS0xNi43IDIyLjQtMjQuNSAzMi42LTMyLjUgNzAuNS01OC4xIDExMi43LTc1LjkgNDMuNi0xOC40IDkwLTI3LjggMTM3LjktMjcuOCA0Ny45IDAgOTQuMyA5LjMgMTM3LjkgMjcuOCA0Mi4yIDE3LjggODAuMSA0My40IDExMi43IDc1LjkgMzIuNiAzMi41IDU4LjEgNzAuNCA3NiAxMTIuNUM4NjUuNyA0MTcuOCA4NzUgNDY0LjEgODc1IDUxMmMwIDQ3LjktOS40IDk0LjItMjcuOCAxMzcuOC0xNy44IDQyLjEtNDMuNCA4MC03NiAxMTIuNXMtNzAuNSA1OC4xLTExMi43IDc1LjlBMzUyLjggMzUyLjggMCAwMTUyMC42IDg2NmMtNDcuOSAwLTk0LjMtOS40LTEzNy45LTI3LjhBMzUzLjg0IDM1My44NCAwIDAxMjcwIDc2Mi4zYy03LjktNy45LTE1LjMtMTYuMS0yMi40LTI0LjUtMy0zLjctNy42LTUuOC0xMi4zLTUuOEgxNjVjLTYuMyAwLTEwLjIgNy02LjcgMTIuM0MyMzQuOSA4NjMuMiAzNjguNSA5NDIgNTIwLjYgOTQyYzIzNi4yIDAgNDI4LTE5MC4xIDQzMC40LTQyNS42Qzk1My40IDI3Ny4xIDc2MS4zIDgyLjYgNTIxLjcgODJ6TTM5NS4wMiA2MjR2LTc2aC0zMTRjLTQuNCAwLTgtMy42LTgtOHYtNTZjMC00LjQgMy42LTggOC04aDMxNHYtNzZjMC02LjcgNy44LTEwLjUgMTMtNi4zbDE0MS45IDExMmE4IDggMCAwMTAgMTIuNmwtMTQxLjkgMTEyYy01LjIgNC4xLTEzIC40LTEzLTYuM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LoginOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LoginOutlined';
}
var _default = exports.default = RefIcon;