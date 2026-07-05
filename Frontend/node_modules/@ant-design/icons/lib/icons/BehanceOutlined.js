"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BehanceOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BehanceOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BehanceOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BehanceOutlined.default
}));

/**![behance](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYzNCAyOTQuM2gxOTkuNXY0OC40SDYzNHpNNDM0LjEgNDg1LjhjNDQuMS0yMS4xIDY3LjItNTMuMiA2Ny4yLTEwMi44IDAtOTguMS03My0xMjEuOS0xNTcuMy0xMjEuOUgxMTJ2NDkyLjRoMjM4LjVjODkuNCAwIDE3My4zLTQzIDE3My4zLTE0MyAwLTYxLjgtMjkuMi0xMDcuNS04OS43LTEyNC43ek0yMjAuMiAzNDUuMWgxMDEuNWMzOS4xIDAgNzQuMiAxMC45IDc0LjIgNTYuMyAwIDQxLjgtMjcuMyA1OC42LTY2IDU4LjZIMjIwLjJWMzQ1LjF6bTExNS41IDMyNC44SDIyMC4xVjUzNC4zSDMzOGM0Ny42IDAgNzcuNyAxOS45IDc3LjcgNzAuMyAwIDQ5LjYtMzUuOSA2NS4zLTgwIDY1LjN6bTU3NS44LTg5LjVjMC0xMDUuNS02MS43LTE5My40LTE3My4zLTE5My40LTEwOC41IDAtMTgyLjMgODEuNy0xODIuMyAxODguOCAwIDExMSA2OS45IDE4Ny4yIDE4Mi4zIDE4Ny4yIDg1LjEgMCAxNDAuMi0zOC4zIDE2Ni43LTEyMGgtODYuM2MtOS40IDMwLjUtNDcuNiA0Ni41LTc3LjMgNDYuNS01Ny40IDAtODcuNC0zMy42LTg3LjQtOTAuN2gyNTYuOWMuMy01LjkuNy0xMi4xLjctMTguNHpNNjUzLjkgNTM3YzMuMS00Ni45IDM0LjQtNzYuMiA4MS4yLTc2LjIgNDkuMiAwIDczLjggMjguOSA3OC4xIDc2LjJINjUzLjl6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(BehanceOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BehanceOutlined';
}
var _default = exports.default = RefIcon;