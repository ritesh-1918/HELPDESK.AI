"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DislikeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DislikeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DislikeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DislikeFilled.default
}));

/**![dislike](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS45IDQ5MC4zYzMuNi0xMiA1LjQtMjQuNCA1LjQtMzcgMC0yOC4zLTkuMy01NS41LTI2LjEtNzcuNyAzLjYtMTIgNS40LTI0LjQgNS40LTM3IDAtMjguMy05LjMtNTUuNS0yNi4xLTc3LjcgMy42LTEyIDUuNC0yNC40IDUuNC0zNyAwLTUxLjYtMzAuNy05OC4xLTc4LjMtMTE4LjRhNjYuMSA2Ni4xIDAgMDAtMjYuNS01LjRIMjczdjQyOGguM2w4NS44IDMxMC44QzM3Mi45IDg4OSA0MTguOSA5MjQgNDcwLjkgOTI0YzI5LjcgMCA1Ny40LTExLjggNzcuOS0zMy40IDIwLjUtMjEuNSAzMS00OS43IDI5LjUtNzkuNGwtNi0xMjIuOWgyMzkuOWMxMi4xIDAgMjMuOS0zLjIgMzQuMy05LjMgNDAuNC0yMy41IDY1LjUtNjYuMSA2NS41LTExMSAwLTI4LjMtOS4zLTU1LjUtMjYuMS03Ny43ek0xMTIgMTMydjM2NGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NVYxMDBoLTY1Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(DislikeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DislikeFilled';
}
var _default = exports.default = RefIcon;