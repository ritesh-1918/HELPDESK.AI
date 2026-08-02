"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ZhihuOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ZhihuOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ZhihuOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ZhihuOutlined.default
}));

/**![zhihu](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU2NC43IDIzMC4xVjgwM2g2MGwyNS4yIDcxLjRMNzU2LjMgODAzaDEzMS41VjIzMC4xSDU2NC43em0yNDcuNyA0OTdoLTU5LjlsLTc1LjEgNTAuNC0xNy44LTUwLjRoLTE4VjMwOC4zaDE3MC43djQxOC44ek01MjYuMSA0ODYuOUgzOTMuM2MyLjEtNDQuOSA0LjMtMTA0LjMgNi42LTE3Mi45aDEzMC45bC0uMS04LjFjMC0uNi0uMi0xNC43LTIuMy0yOS4xLTIuMS0xNS02LjYtMzQuOS0yMS0zNC45SDI4Ny44YzQuNC0yMC42IDE1LjctNjkuNyAyOS40LTkzLjhsNi40LTExLjItMTIuOS0uN2MtLjggMC0xOS42LS45LTQxLjQgMTAuNi0zNS43IDE5LTUxLjcgNTYuNC01OC43IDg0LjQtMTguNCA3My4xLTQ0LjYgMTIzLjktNTUuNyAxNDUuNi0zLjMgNi40LTUuMyAxMC4yLTYuMiAxMi44LTEuOCA0LjktLjggOS44IDIuOCAxMyAxMC41IDkuNSAzOC4yLTIuOSAzOC41LTMgLjYtLjMgMS4zLS42IDIuMi0xIDEzLjktNi4zIDU1LjEtMjUgNjkuOC04NC41aDU2LjdjLjcgMzIuMiAzLjEgMTM4LjQgMi45IDE3Mi45aC0xNDFsLTIuMSAxLjVjLTIzLjEgMTYuOS0zMC41IDYzLjItMzAuOCA2NS4ybC0xLjQgOS4yaDE2N2MtMTIuMyA3OC4zLTI2LjUgMTEzLjQtMzQgMTI3LjQtMy43IDctNy4zIDE0LTEwLjcgMjAuOC0yMS4zIDQyLjItNDMuNCA4NS44LTEyNi4zIDE1My42LTMuNiAyLjgtNyA4LTQuOCAxMy43IDIuNCA2LjMgOS4zIDkuMSAyNC42IDkuMSA1LjQgMCAxMS44LS4zIDE5LjQtMSA0OS45LTQuNCAxMDAuOC0xOCAxMzUuMS04Ny42IDE3LTM1LjEgMzEuNy03MS43IDQzLjktMTA4LjlMNDk3IDg1MGw1LTEyYy44LTEuOSAxOS00Ni4zIDUuMS05NS45bC0uNS0xLjgtMTA4LjEtMTIzLTIyIDE2LjZjNi40LTI2LjEgMTAuNi00OS45IDEyLjUtNzEuMWgxNTguN3YtOGMwLTQwLjEtMTguNS02My45LTE5LjItNjQuOWwtMi40LTN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ZhihuOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ZhihuOutlined';
}
var _default = exports.default = RefIcon;