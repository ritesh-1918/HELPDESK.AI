"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RedEnvelopeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RedEnvelopeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RedEnvelopeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RedEnvelopeFilled.default
}));

/**![red-envelope](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgzMiA2NEgxOTJjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjgzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NDBjMTcuNyAwIDMyLTE0LjMgMzItMzJWOTZjMC0xNy43LTE0LjMtMzItMzItMzJ6TTY0NyA0NzAuNGwtODcuMiAxNjFoNDUuOWM0LjYgMCA4LjQgMy44IDguNCA4LjR2MjUuMWMwIDQuNi0zLjggOC40LTguNCA4LjRoLTYzLjN2MjguNmg2My4zYzQuNiAwIDguNCAzLjggOC40IDguNHYyNWMuMiA0LjYtMy42IDguNS04LjIgOC41aC02My4zdjQ5LjljMCA0LjYtMy44IDguNC04LjQgOC40aC00My43Yy00LjYgMC04LjQtMy44LTguNC04LjR2LTQ5LjloLTYzYy00LjYgMC04LjQtMy44LTguNC04LjR2LTI1LjFjMC00LjYgMy44LTguNCA4LjQtOC40aDYzdi0yOC42aC02M2MtNC42IDAtOC40LTMuOC04LjQtOC40di0yNS4xYzAtNC42IDMuOC04LjQgOC40LTguNGg0NS40bC04Ny41LTE2MWMtMi4yLTQuMS0uNy05LjEgMy40LTExLjQgMS4zLS42IDIuNi0xIDMuOS0xaDQ4LjhjMy4yIDAgNi4xIDEuOCA3LjUgNC42bDcxLjkgMTQxLjggNzEuOS0xNDEuOWE4LjUgOC41IDAgMDE3LjUtNC42aDQ3LjhjNC42IDAgOC40IDMuOCA4LjQgOC40LS4xIDEuNS0uNSAyLjktMS4xIDQuMXpNNTEyLjYgMzIzTDI4OSAxNDhoNDQ2TDUxMi42IDMyM3oiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(RedEnvelopeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RedEnvelopeFilled';
}
var _default = exports.default = RefIcon;