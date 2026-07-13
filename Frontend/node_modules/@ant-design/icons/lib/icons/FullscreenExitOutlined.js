"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FullscreenExitOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FullscreenExitOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FullscreenExitOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FullscreenExitOutlined.default
}));

/**![fullscreen-exit](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5MSAyNDAuOWMtLjgtNi42LTguOS05LjQtMTMuNi00LjdsLTQzLjcgNDMuN0wyMDAgMTQ2LjNhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC00Mi40IDQyLjNhOC4wMyA4LjAzIDAgMDAwIDExLjNMMjgwIDMzMy42bC00My45IDQzLjlhOC4wMSA4LjAxIDAgMDA0LjcgMTMuNkw0MDEgNDEwYzUuMS42IDkuNS0zLjcgOC45LTguOUwzOTEgMjQwLjl6bTEwLjEgMzczLjJMMjQwLjggNjMzYy02LjYuOC05LjQgOC45LTQuNyAxMy42bDQzLjkgNDMuOUwxNDYuMyA4MjRhOC4wMyA4LjAzIDAgMDAwIDExLjNsNDIuNCA0Mi4zYzMuMSAzLjEgOC4yIDMuMSAxMS4zIDBMMzMzLjcgNzQ0bDQzLjcgNDMuN0E4LjAxIDguMDEgMCAwMDM5MSA3ODNsMTguOS0xNjAuMWMuNi01LjEtMy43LTkuNC04LjgtOC44em0yMjEuOC0yMDQuMkw3ODMuMiAzOTFjNi42LS44IDkuNC04LjkgNC43LTEzLjZMNzQ0IDMzMy42IDg3Ny43IDIwMGMzLjEtMy4xIDMuMS04LjIgMC0xMS4zbC00Mi40LTQyLjNhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDY5MC4zIDI3OS45bC00My43LTQzLjdhOC4wMSA4LjAxIDAgMDAtMTMuNiA0LjdMNjE0LjEgNDAxYy0uNiA1LjIgMy43IDkuNSA4LjggOC45ek03NDQgNjkwLjRsNDMuOS00My45YTguMDEgOC4wMSAwIDAwLTQuNy0xMy42TDYyMyA2MTRjLTUuMS0uNi05LjUgMy43LTguOSA4LjlMNjMzIDc4My4xYy44IDYuNiA4LjkgOS40IDEzLjYgNC43bDQzLjctNDMuN0w4MjQgODc3LjdjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGw0Mi40LTQyLjNjMy4xLTMuMSAzLjEtOC4yIDAtMTEuM0w3NDQgNjkwLjR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FullscreenExitOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FullscreenExitOutlined';
}
var _default = exports.default = RefIcon;