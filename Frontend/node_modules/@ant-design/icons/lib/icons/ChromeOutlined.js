"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ChromeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ChromeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ChromeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ChromeOutlined.default
}));

/**![chrome](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCA1MTIuM3YtLjNjMC0yMjkuOC0xODYuMi00MTYtNDE2LTQxNlM5NiAyODIuMiA5NiA1MTJ2LjRjMCAyMjkuOCAxODYuMiA0MTYgNDE2IDQxNnM0MTYtMTg2LjIgNDE2LTQxNnYtLjMuMnptLTYuNy03NC42bC42IDMuMy0uNi0zLjN6TTY3Ni43IDYzOC4yYzUzLjUtODIuMiA1Mi41LTE4OS40LTExLjEtMjYzLjdsMTYyLjQtOC40YzIwLjUgNDQuNCAzMiA5My44IDMyIDE0NS45IDAgMTg1LjItMTQ0LjYgMzM2LjYtMzI3LjEgMzQ3LjRsMTQzLjgtMjIxLjJ6TTUxMiA2NTIuM2MtNzcuNSAwLTE0MC4yLTYyLjctMTQwLjItMTQwLjIgMC03Ny43IDYyLjctMTQwLjIgMTQwLjItMTQwLjJTNjUyLjIgNDM0LjUgNjUyLjIgNTEyIDU4OS41IDY1Mi4zIDUxMiA2NTIuM3ptMzY5LjItMzMxLjdsLTMtNS43IDMgNS43ek01MTIgMTY0YzEyMS4zIDAgMjI4LjIgNjIuMSAyOTAuNCAxNTYuMmwtMjYzLjYtMTMuOWMtOTcuNS01LjctMTkwLjIgNDkuMi0yMjIuMyAxNDEuMUwyMjcuOCAzMTFjNjMuMS04OC45IDE2Ni45LTE0NyAyODQuMi0xNDd6TTEwMi41IDU4NS44YzI2IDE0NSAxMjcuMSAyNjQgMjYxLjYgMzE1LjFDMjI5LjYgODUwIDEyOC41IDczMSAxMDIuNSA1ODUuOHpNMTY0IDUxMmMwLTU1LjkgMTMuMi0xMDguNyAzNi42LTE1NS41bDExOS43IDIzNS40YzQ0LjEgODYuNyAxMzcuNCAxMzkuNyAyMzQgMTIxLjZsLTc0IDE0NS4xQzMwMi45IDg0Mi41IDE2NCA2OTMuNSAxNjQgNTEyem0zMjQuNyA0MTUuNGM0IC4yIDggLjQgMTIgLjUtNC0uMi04LS4zLTEyLS41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(ChromeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ChromeOutlined';
}
var _default = exports.default = RefIcon;