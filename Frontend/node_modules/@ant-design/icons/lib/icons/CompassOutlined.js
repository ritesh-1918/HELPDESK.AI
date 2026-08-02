"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CompassOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CompassOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CompassOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CompassOutlined.default
}));

/**![compass](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnptMTk4LjQtNTg4LjFhMzIgMzIgMCAwMC0yNC41LjVMNDE0LjkgNDE1IDI5Ni40IDY4NmMtMy42IDguMi0zLjYgMTcuNSAwIDI1LjcgMy40IDcuOCA5LjcgMTMuOSAxNy43IDE3IDMuOCAxLjUgNy43IDIuMiAxMS43IDIuMiA0LjQgMCA4LjctLjkgMTIuOC0yLjdsMjcxLTExOC42IDExOC41LTI3MWEzMi4wNiAzMi4wNiAwIDAwLTE3LjctNDIuN3pNNTc2LjggNTM0LjRsMjYuMiAyNi4yLTQyLjQgNDIuNC0yNi4yLTI2LjJMMzgwIDY0NC40IDQ0Ny41IDQ5MCA0MjIgNDY0LjRsNDIuNC00Mi40IDI1LjUgMjUuNUw2NDQuNCAzODBsLTY3LjYgMTU0LjR6TTQ2NC40IDQyMkw0MjIgNDY0LjRsMjUuNSAyNS42IDg2LjkgODYuOCAyNi4yIDI2LjIgNDIuNC00Mi40LTI2LjItMjYuMi04Ni44LTg2Ljl6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CompassOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CompassOutlined';
}
var _default = exports.default = RefIcon;