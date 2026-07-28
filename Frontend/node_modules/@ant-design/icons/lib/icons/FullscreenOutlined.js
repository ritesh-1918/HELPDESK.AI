"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FullscreenOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FullscreenOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FullscreenOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FullscreenOutlined.default
}));

/**![fullscreen](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5MCAyMzYuNGw0My45LTQzLjlhOC4wMSA4LjAxIDAgMDAtNC43LTEzLjZMMTY5IDE2MGMtNS4xLS42LTkuNSAzLjctOC45IDguOUwxNzkgMzI5LjFjLjggNi42IDguOSA5LjQgMTMuNiA0LjdsNDMuNy00My43TDM3MCA0MjMuN2MzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDQyLjQtNDIuM2MzLjEtMy4xIDMuMS04LjIgMC0xMS4zTDI5MCAyMzYuNHptMzUyLjcgMTg3LjNjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGwxMzMuNy0xMzMuNiA0My43IDQzLjdhOC4wMSA4LjAxIDAgMDAxMy42LTQuN0w4NjMuOSAxNjljLjYtNS4xLTMuNy05LjUtOC45LTguOUw2OTQuOCAxNzljLTYuNi44LTkuNCA4LjktNC43IDEzLjZsNDMuOSA0My45TDYwMC4zIDM3MGE4LjAzIDguMDMgMCAwMDAgMTEuM2w0Mi40IDQyLjR6TTg0NSA2OTQuOWMtLjgtNi42LTguOS05LjQtMTMuNi00LjdsLTQzLjcgNDMuN0w2NTQgNjAwLjNhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC00Mi40IDQyLjNhOC4wMyA4LjAzIDAgMDAwIDExLjNMNzM0IDc4Ny42bC00My45IDQzLjlhOC4wMSA4LjAxIDAgMDA0LjcgMTMuNkw4NTUgODY0YzUuMS42IDkuNS0zLjcgOC45LTguOUw4NDUgNjk0Ljl6bS00NjMuNy05NC42YTguMDMgOC4wMyAwIDAwLTExLjMgMEwyMzYuMyA3MzMuOWwtNDMuNy00My43YTguMDEgOC4wMSAwIDAwLTEzLjYgNC43TDE2MC4xIDg1NWMtLjYgNS4xIDMuNyA5LjUgOC45IDguOUwzMjkuMiA4NDVjNi42LS44IDkuNC04LjkgNC43LTEzLjZMMjkwIDc4Ny42IDQyMy43IDY1NGMzLjEtMy4xIDMuMS04LjIgMC0xMS4zbC00Mi40LTQyLjR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FullscreenOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FullscreenOutlined';
}
var _default = exports.default = RefIcon;