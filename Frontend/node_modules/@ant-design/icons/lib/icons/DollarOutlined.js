"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DollarOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DollarOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DollarOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DollarOutlined.default
}));

/**![dollar](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnptNDcuNy0zOTUuMmwtMjUuNC01LjlWMzQ4LjZjMzggNS4yIDYxLjUgMjkgNjUuNSA1OC4yLjUgNCAzLjkgNi45IDcuOSA2LjloNDQuOWM0LjcgMCA4LjQtNC4xIDgtOC44LTYuMS02Mi4zLTU3LjQtMTAyLjMtMTI1LjktMTA5LjJWMjYzYzAtNC40LTMuNi04LTgtOGgtMjguMWMtNC40IDAtOCAzLjYtOCA4djMzYy03MC44IDYuOS0xMjYuMiA0Ni0xMjYuMiAxMTkgMCA2Ny42IDQ5LjggMTAwLjIgMTAyLjEgMTEyLjdsMjQuNyA2LjN2MTQyLjdjLTQ0LjItNS45LTY5LTI5LjUtNzQuMS02MS4zLS42LTMuOC00LTYuNi03LjktNi42SDM2M2MtNC43IDAtOC40IDQtOCA4LjcgNC41IDU1IDQ2LjIgMTA1LjYgMTM1LjIgMTEyLjFWNzYxYzAgNC40IDMuNiA4IDggOGgyOC40YzQuNCAwIDgtMy42IDgtOC4xbC0uMi0zMS43Yzc4LjMtNi45IDEzNC4zLTQ4LjggMTM0LjMtMTI0LS4xLTY5LjQtNDQuMi0xMDAuNC0xMDktMTE2LjR6bS02OC42LTE2LjJjLTUuNi0xLjYtMTAuMy0zLjEtMTUtNS0zMy44LTEyLjItNDkuNS0zMS45LTQ5LjUtNTcuMyAwLTM2LjMgMjcuNS01NyA2NC41LTYxLjd2MTI0ek01MzQuMyA2NzdWNTQzLjNjMy4xLjkgNS45IDEuNiA4LjggMi4yIDQ3LjMgMTQuNCA2My4yIDM0LjQgNjMuMiA2NS4xIDAgMzkuMS0yOS40IDYyLjYtNzIgNjYuNHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DollarOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DollarOutlined';
}
var _default = exports.default = RefIcon;