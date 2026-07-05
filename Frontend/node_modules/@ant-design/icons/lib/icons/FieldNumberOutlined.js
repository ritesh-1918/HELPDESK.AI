"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FieldNumberOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FieldNumberOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FieldNumberOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FieldNumberOutlined.default
}));

/**![field-number](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik01MDggMjgwaC02My4zYy0zLjMgMC02IDIuNy02IDZ2MzQwLjJINDMzTDE5Ny40IDI4Mi42Yy0xLjEtMS42LTMtMi42LTQuOS0yLjZIMTI2Yy0zLjMgMC02IDIuNy02IDZ2NDY0YzAgMy4zIDIuNyA2IDYgNmg2Mi43YzMuMyAwIDYtMi43IDYtNlY0MDUuMWg1LjdsMjM4LjIgMzQ4LjNjMS4xIDEuNiAzIDIuNiA1IDIuNkg1MDhjMy4zIDAgNi0yLjcgNi02VjI4NmMwLTMuMy0yLjctNi02LTZ6bTM3OCA0MTNINTgyYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDMwNGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHptLTE1Mi4yLTYzYzUyLjkgMCA5NS4yLTE3LjIgMTI2LjItNTEuNyAyOS40LTMyLjkgNDQtNzUuOCA0NC0xMjguOCAwLTUzLjEtMTQuNi05Ni41LTQ0LTEyOS4zLTMwLjktMzQuOC03My4yLTUyLjItMTI2LjItNTIuMi01My43IDAtOTUuOSAxNy41LTEyNi4zIDUyLjgtMjkuMiAzMy4xLTQzLjQgNzUuOS00My40IDEyOC43IDAgNTIuNCAxNC4zIDk1LjIgNDMuNSAxMjguMyAzMC42IDM0LjcgNzMgNTIuMiAxMjYuMiA1Mi4yem0tNzEuNS0yNjMuN2MxNi45LTIwLjYgNDAuMy0zMC45IDcxLjQtMzAuOSAzMS41IDAgNTQuOCA5LjYgNzEgMjkuMSAxNi40IDIwLjMgMjQuOSA0OC42IDI0LjkgODQuOSAwIDM2LjMtOC40IDY0LjEtMjQuOCA4My45LTE2LjUgMTkuNC00MCAyOS4yLTcxLjEgMjkuMi0zMS4yIDAtNTUtMTAuMy03MS40LTMwLjQtMTYuMy0yMC4xLTI0LjUtNDcuMy0yNC41LTgyLjYuMS0zNS44IDguMi02MyAyNC41LTgzLjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FieldNumberOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FieldNumberOutlined';
}
var _default = exports.default = RefIcon;