"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _YuqueOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/YuqueOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const YuqueOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _YuqueOutlined.default
}));

/**![yuque](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDM3MC42Yy05LjktMzkuNCA5LjktMTAyLjIgNzMuNC0xMjQuNGwtNjcuOS0zLjZzLTI1LjctOTAtMTQzLjYtOThjLTExNy44LTguMS0xOTQuOS0zLTE5NS0zIC4xIDAgODcuNCA1NS42IDUyLjQgMTU0LjctMjUuNiA1Mi41LTY1LjggOTUuNi0xMDguOCAxNDQuNy0xLjMgMS4zLTIuNSAyLjYtMy41IDMuN0MzMTkuNCA2MDUgOTYgODYwIDk2IDg2MGMyNDUuOSA2NC40IDQxMC43LTYuMyA1MDguMi05MS4xIDIwLjUtLjIgMzUuOS0uMyA0Ni4zLS4zIDEzNS44IDAgMjUwLjYtMTE3LjYgMjQ1LjktMjQ4LjQtMy4yLTg5LjktMzEuOS0xMTAuMi00MS44LTE0OS42em0tMjA0LjEgMzM0Yy0xMC42IDAtMjYuMi4xLTQ2LjguM2wtMjMuNi4yLTE3LjggMTUuNWMtNDcuMSA0MS0xMDQuNCA3MS41LTE3MS40IDg3LjYtNTIuNSAxMi42LTExMCAxNi4yLTE3Mi43IDkuNiAxOC0yMC41IDM2LjUtNDEuNiA1NS40LTYzLjEgOTItMTA0LjYgMTczLjgtMTk3LjUgMjM2LjktMjY4LjVsMS40LTEuNCAxLjMtMS41YzQuMS00LjYgMjAuNi0yMy4zIDI0LjctMjguMSA5LjctMTEuMSAxNy4zLTE5LjkgMjQuNS0yOC42IDMwLjctMzYuNyA1Mi4yLTY3LjggNjktMTAyLjJsMS42LTMuMyAxLjItMy40YzEzLjctMzguOCAxNS40LTc2LjkgNi4yLTExMi44IDIyLjUuNyA0Ni41IDEuOSA3MS43IDMuNiAzMy4zIDIuMyA1NS41IDEyLjkgNzEuMSAyOS4yIDUuOCA2IDEwLjIgMTIuNSAxMy40IDE4LjcgMSAyIDEuNyAzLjYgMi4zIDVsNSAxNy43Yy0xNS43IDM0LjUtMTkuOSA3My4zLTExLjQgMTA3LjIgMyAxMS44IDYuOSAyMi40IDEyLjMgMzQuNCAyLjEgNC43IDkuNSAyMC4xIDExIDIzLjMgMTAuMyAyMi43IDE1LjQgNDMgMTYuNyA3OC43IDMuMyA5NC42LTgyLjcgMTgxLjktMTgyIDE4MS45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(YuqueOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'YuqueOutlined';
}
var _default = exports.default = RefIcon;