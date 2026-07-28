"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CameraFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CameraFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CameraFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CameraFilled.default
}));

/**![camera](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2NCAyNjBINzI4bC0zMi40LTkwLjhhMzIuMDcgMzIuMDcgMCAwMC0zMC4yLTIxLjJIMzU4LjZjLTEzLjUgMC0yNS42IDguNS0zMC4xIDIxLjJMMjk2IDI2MEgxNjBjLTQ0LjIgMC04MCAzNS44LTgwIDgwdjQ1NmMwIDQ0LjIgMzUuOCA4MCA4MCA4MGg3MDRjNDQuMiAwIDgwLTM1LjggODAtODBWMzQwYzAtNDQuMi0zNS44LTgwLTgwLTgwek01MTIgNzE2Yy04OC40IDAtMTYwLTcxLjYtMTYwLTE2MHM3MS42LTE2MCAxNjAtMTYwIDE2MCA3MS42IDE2MCAxNjAtNzEuNiAxNjAtMTYwIDE2MHptLTk2LTE2MGE5NiA5NiAwIDEwMTkyIDAgOTYgOTYgMCAxMC0xOTIgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CameraFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CameraFilled';
}
var _default = exports.default = RefIcon;