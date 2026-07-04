"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IeOutlined.default
}));

/**![ie](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1Mi42IDM2Ny42YzE2LjMtMzYuOSAzMi4xLTkwLjcgMzIuMS0xMzEuOCAwLTEwOS4xLTExOS41LTE0Ny42LTMxNC41LTU3LjktMTYxLjQtMTAuOC0zMTYuOCAxMTAuNS0zNTUuNiAyNzkuNyA0Ni4zLTUyLjMgMTE3LjQtMTIzLjQgMTgzLTE1MS43QzMxNi4xIDM3OC4zIDI0Ni43IDQ3MCAxOTQgNTY1LjZjLTMxLjEgNTYuOS02NiAxNDguOC02NiAyMTcuNSAwIDE0Ny45IDEzOS4zIDEyOS44IDI3MC40IDYzIDQ3LjEgMjMuMSA5OS44IDIzLjQgMTUyLjUgMjMuNCAxNDUuNyAwIDI3Ni40LTgxLjQgMzI1LjItMjE5SDY5NC45Yy03OC44IDEzMi45LTI5NS4yIDc5LjUtMjk1LjItNzEuMmg0OTMuMmM5LjYtNjUuNC0yLjUtMTQzLjYtNDAuMy0yMTEuN3pNMjI0LjggNjQ4LjNjMjYuNiA3Ni43IDgwLjYgMTQzLjggMTUwLjQgMTg1LTEzMy4xIDczLjQtMjU5LjkgNDMuNi0xNTAuNC0xODV6bTE3NC0xNjMuM2MzLTgyLjcgNzUuNC0xNDIuMyAxNTYtMTQyLjMgODAuMSAwIDE1MyA1OS42IDE1NiAxNDIuM2gtMzEyem0yNzYuOC0yODEuNGMzMi4xLTE1LjQgNzIuOC0zMyAxMDguOC0zMyA0Ny4xIDAgODEuNCAzMi42IDgxLjQgODAuNiAwIDMwLTExLjEgNzMuNS0yMS45IDEwMS44LTM5LjMtNjMuNS05OC45LTEyMi40LTE2OC4zLTE0OS40eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(IeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IeOutlined';
}
var _default = exports.default = RefIcon;