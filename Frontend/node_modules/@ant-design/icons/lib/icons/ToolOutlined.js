"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ToolOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ToolOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ToolOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ToolOutlined.default
}));

/**![tool](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3Ni42IDIzOS41Yy0uNS0uOS0xLjItMS44LTItMi41LTUtNS0xMy4xLTUtMTguMSAwTDY4NC4yIDQwOS4zbC02Ny45LTY3LjlMNzg4LjcgMTY5Yy44LS44IDEuNC0xLjYgMi0yLjUgMy42LTYuMSAxLjYtMTMuOS00LjUtMTcuNS05OC4yLTU4LTIyNi44LTQ0LjctMzExLjMgMzkuNy02NyA2Ny04OS4yIDE2Mi02Ni41IDI0Ny40bC0yOTMgMjkzYy0zIDMtMi44IDcuOS4zIDExbDE2OS43IDE2OS43YzMuMSAzLjEgOC4xIDMuMyAxMSAuM2wyOTIuOS0yOTIuOWM4NS41IDIyLjggMTgwLjUuNyAyNDcuNi02Ni40IDg0LjQtODQuNSA5Ny43LTIxMy4xIDM5LjctMzExLjN6TTc4NiA0OTkuOGMtNTguMSA1OC4xLTE0NS4zIDY5LjMtMjE0LjYgMzMuNmwtOC44IDguOC0uMS0uMS0yNzQgMjc0LjEtNzkuMi03OS4yIDIzMC4xLTIzMC4xczAgLjEuMS4xbDUyLjgtNTIuOGMtMzUuNy02OS4zLTI0LjUtMTU2LjUgMzMuNi0yMTQuNmExODQuMiAxODQuMiAwIDAxMTQ0LTUzLjVMNTM3IDMxOC45YTMyLjA1IDMyLjA1IDAgMDAwIDQ1LjNsMTI0LjUgMTI0LjVhMzIuMDUgMzIuMDUgMCAwMDQ1LjMgMGwxMzIuOC0xMzIuOGMzLjcgNTEuOC0xNC40IDEwNC44LTUzLjYgMTQzLjl6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ToolOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ToolOutlined';
}
var _default = exports.default = RefIcon;