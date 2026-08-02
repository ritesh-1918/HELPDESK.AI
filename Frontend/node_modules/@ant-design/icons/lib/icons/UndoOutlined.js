"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _UndoOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/UndoOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const UndoOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _UndoOutlined.default
}));

/**![undo](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMS40IDEyNEMyOTAuNSAxMjQuMyAxMTIgMzAzIDExMiA1MjMuOWMwIDEyOCA2MC4yIDI0MiAxNTMuOCAzMTUuMmwtMzcuNSA0OGMtNC4xIDUuMy0uMyAxMyA2LjMgMTIuOWwxNjctLjhjNS4yIDAgOS00LjkgNy43LTkuOUwzNjkuOCA3MjdhOCA4IDAgMDAtMTQuMS0zTDMxNSA3NzYuMWMtMTAuMi04LTIwLTE2LjctMjkuMy0yNmEzMTguNjQgMzE4LjY0IDAgMDEtNjguNi0xMDEuN0MyMDAuNCA2MDkgMTkyIDU2Ny4xIDE5MiA1MjMuOXM4LjQtODUuMSAyNS4xLTEyNC41YzE2LjEtMzguMSAzOS4yLTcyLjMgNjguNi0xMDEuNyAyOS40LTI5LjQgNjMuNi01Mi41IDEwMS43LTY4LjZDNDI2LjkgMjEyLjQgNDY4LjggMjA0IDUxMiAyMDRzODUuMSA4LjQgMTI0LjUgMjUuMWMzOC4xIDE2LjEgNzIuMyAzOS4yIDEwMS43IDY4LjYgMjkuNCAyOS40IDUyLjUgNjMuNiA2OC42IDEwMS43IDE2LjcgMzkuNCAyNS4xIDgxLjMgMjUuMSAxMjQuNXMtOC40IDg1LjEtMjUuMSAxMjQuNWEzMTguNjQgMzE4LjY0IDAgMDEtNjguNiAxMDEuN2MtNy41IDcuNS0xNS4zIDE0LjUtMjMuNCAyMS4yYTcuOTMgNy45MyAwIDAwLTEuMiAxMS4xbDM5LjQgNTAuNWMyLjggMy41IDcuOSA0LjEgMTEuNCAxLjNDODU0LjUgNzYwLjggOTEyIDY0OS4xIDkxMiA1MjMuOWMwLTIyMS4xLTE3OS40LTQwMC4yLTQwMC42LTM5OS45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(UndoOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'UndoOutlined';
}
var _default = exports.default = RefIcon;