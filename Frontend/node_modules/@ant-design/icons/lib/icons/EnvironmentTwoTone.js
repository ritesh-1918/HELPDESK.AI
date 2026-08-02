"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _EnvironmentTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/EnvironmentTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const EnvironmentTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _EnvironmentTwoTone.default
}));

/**![environment](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcyNC40IDIyNC45QzY2Ny43IDE2OS41IDU5Mi4zIDEzOSA1MTIgMTM5cy0xNTUuNyAzMC41LTIxMi40IDg1LjhDMjQzLjEgMjgwIDIxMiAzNTMuMiAyMTIgNDMxLjFjMCAyNDEuMyAyMzQuMSA0MDcuMiAzMDAgNDQ5LjEgNjUuOS00MS45IDMwMC0yMDcuOCAzMDAtNDQ5LjEgMC03Ny45LTMxLjEtMTUxLjEtODcuNi0yMDYuMnpNNTEyIDYxNWMtOTcuMiAwLTE3Ni03OC44LTE3Ni0xNzZzNzguOC0xNzYgMTc2LTE3NiAxNzYgNzguOCAxNzYgMTc2LTc4LjggMTc2LTE3NiAxNzZ6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik01MTIgMjYzYy05Ny4yIDAtMTc2IDc4LjgtMTc2IDE3NnM3OC44IDE3NiAxNzYgMTc2IDE3Ni03OC44IDE3Ni0xNzYtNzguOC0xNzYtMTc2LTE3NnptNzkuMiAyNTUuMkExMTEuNiAxMTEuNiAwIDAxNTEyIDU1MWMtMjkuOSAwLTU4LTExLjctNzkuMi0zMi44QTExMS42IDExMS42IDAgMDE0MDAgNDM5YzAtMjkuOSAxMS43LTU4IDMyLjgtNzkuMkM0NTQgMzM4LjYgNDgyLjEgMzI3IDUxMiAzMjdjMjkuOSAwIDU4IDExLjYgNzkuMiAzMi44UzYyNCA0MDkuMSA2MjQgNDM5YzAgMjkuOS0xMS42IDU4LTMyLjggNzkuMnoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTg1NC42IDI4OS4xYTM2Mi40OSAzNjIuNDkgMCAwMC03OS45LTExNS43IDM3MC44MyAzNzAuODMgMCAwMC0xMTguMi03Ny44QzYxMC43IDc2LjYgNTYyLjEgNjcgNTEyIDY3Yy01MC4xIDAtOTguNyA5LjYtMTQ0LjUgMjguNS00NC4zIDE4LjMtODQgNDQuNS0xMTguMiA3Ny44QTM2My42IDM2My42IDAgMDAxNjkuNCAyODljLTE5LjUgNDUtMjkuNCA5Mi44LTI5LjQgMTQyIDAgNzAuNiAxNi45IDE0MC45IDUwLjEgMjA4LjcgMjYuNyA1NC41IDY0IDEwNy42IDExMSAxNTguMSA4MC4zIDg2LjIgMTY0LjUgMTM4LjkgMTg4LjQgMTUzYTQzLjkgNDMuOSAwIDAwMjIuNCA2LjFjNy44IDAgMTUuNS0yIDIyLjQtNi4xIDIzLjktMTQuMSAxMDguMS02Ni44IDE4OC40LTE1MyA0Ny01MC40IDg0LjMtMTAzLjYgMTExLTE1OC4xQzg2Ny4xIDU3MiA4ODQgNTAxLjggODg0IDQzMS4xYzAtNDkuMi05LjktOTctMjkuNC0xNDJ6TTUxMiA4ODAuMmMtNjUuOS00MS45LTMwMC0yMDcuOC0zMDAtNDQ5LjEgMC03Ny45IDMxLjEtMTUxLjEgODcuNi0yMDYuM0MzNTYuMyAxNjkuNSA0MzEuNyAxMzkgNTEyIDEzOXMxNTUuNyAzMC41IDIxMi40IDg1LjlDNzgwLjkgMjgwIDgxMiAzNTMuMiA4MTIgNDMxLjFjMCAyNDEuMy0yMzQuMSA0MDcuMi0zMDAgNDQ5LjF6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(EnvironmentTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'EnvironmentTwoTone';
}
var _default = exports.default = RefIcon;