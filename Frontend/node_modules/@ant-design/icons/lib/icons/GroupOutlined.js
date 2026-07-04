"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GroupOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GroupOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GroupOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GroupOutlined.default
}));

/**![group](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik05MTIgODIwLjFWMjAzLjljMjgtOS45IDQ4LTM2LjYgNDgtNjcuOSAwLTM5LjgtMzIuMi03Mi03Mi03Mi0zMS4zIDAtNTggMjAtNjcuOSA0OEgyMDMuOUMxOTQgODQgMTY3LjMgNjQgMTM2IDY0Yy0zOS44IDAtNzIgMzIuMi03MiA3MiAwIDMxLjMgMjAgNTggNDggNjcuOXY2MTYuMkM4NCA4MzAgNjQgODU2LjcgNjQgODg4YzAgMzkuOCAzMi4yIDcyIDcyIDcyIDMxLjMgMCA1OC0yMCA2Ny45LTQ4aDYxNi4yYzkuOSAyOCAzNi42IDQ4IDY3LjkgNDggMzkuOCAwIDcyLTMyLjIgNzItNzIgMC0zMS4zLTIwLTU4LTQ4LTY3Ljl6TTg4OCAxMTJjMTMuMyAwIDI0IDEwLjcgMjQgMjRzLTEwLjcgMjQtMjQgMjQtMjQtMTAuNy0yNC0yNCAxMC43LTI0IDI0LTI0ek0xMzYgOTEyYy0xMy4zIDAtMjQtMTAuNy0yNC0yNHMxMC43LTI0IDI0LTI0IDI0IDEwLjcgMjQgMjQtMTAuNyAyNC0yNCAyNHptMC03NTJjLTEzLjMgMC0yNC0xMC43LTI0LTI0czEwLjctMjQgMjQtMjQgMjQgMTAuNyAyNCAyNC0xMC43IDI0LTI0IDI0em03MDQgNjgwSDE4NFYxODRoNjU2djY1NnptNDggNzJjLTEzLjMgMC0yNC0xMC43LTI0LTI0czEwLjctMjQgMjQtMjQgMjQgMTAuNyAyNCAyNC0xMC43IDI0LTI0IDI0eiIgLz48cGF0aCBkPSJNMjg4IDQ3NGg0NDhjOC44IDAgMTYtNy4yIDE2LTE2VjI4MmMwLTguOC03LjItMTYtMTYtMTZIMjg4Yy04LjggMC0xNiA3LjItMTYgMTZ2MTc2YzAgOC44IDcuMiAxNiAxNiAxNnptNTYtMTM2aDMzNnY2NEgzNDR2LTY0em0tNTYgNDIwaDQ0OGM4LjggMCAxNi03LjIgMTYtMTZWNTY2YzAtOC44LTcuMi0xNi0xNi0xNkgyODhjLTguOCAwLTE2IDcuMi0xNiAxNnYxNzZjMCA4LjggNy4yIDE2IDE2IDE2em01Ni0xMzZoMzM2djY0SDM0NHYtNjR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(GroupOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GroupOutlined';
}
var _default = exports.default = RefIcon;