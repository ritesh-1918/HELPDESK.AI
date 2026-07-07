"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloudOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CloudOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CloudOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CloudOutlined.default
}));

/**![cloud](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgxMS40IDQxOC43Qzc2NS42IDI5Ny45IDY0OC45IDIxMiA1MTIuMiAyMTJTMjU4LjggMjk3LjggMjEzIDQxOC42QzEyNy4zIDQ0MS4xIDY0IDUxOS4xIDY0IDYxMmMwIDExMC41IDg5LjUgMjAwIDE5OS45IDIwMGg0OTYuMkM4NzAuNSA4MTIgOTYwIDcyMi41IDk2MCA2MTJjMC05Mi43LTYzLjEtMTcwLjctMTQ4LjYtMTkzLjN6bTM2LjMgMjgxYTEyMy4wNyAxMjMuMDcgMCAwMS04Ny42IDM2LjNIMjYzLjljLTMzLjEgMC02NC4yLTEyLjktODcuNi0zNi4zQTEyMy4zIDEyMy4zIDAgMDExNDAgNjEyYzAtMjggOS4xLTU0LjMgMjYuMi03Ni4zYTEyNS43IDEyNS43IDAgMDE2Ni4xLTQzLjdsMzcuOS05LjkgMTMuOS0zNi42YzguNi0yMi44IDIwLjYtNDQuMSAzNS43LTYzLjRhMjQ1LjYgMjQ1LjYgMCAwMTUyLjQtNDkuOWM0MS4xLTI4LjkgODkuNS00NC4yIDE0MC00NC4yczk4LjkgMTUuMyAxNDAgNDQuMmMxOS45IDE0IDM3LjUgMzAuOCA1Mi40IDQ5LjkgMTUuMSAxOS4zIDI3LjEgNDAuNyAzNS43IDYzLjRsMTMuOCAzNi41IDM3LjggMTBjNTQuMyAxNC41IDkyLjEgNjMuOCA5Mi4xIDEyMCAwIDMzLjEtMTIuOSA2NC4zLTM2LjMgODcuN3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CloudOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CloudOutlined';
}
var _default = exports.default = RefIcon;