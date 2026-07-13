"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PhoneFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PhoneFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PhoneFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PhoneFilled.default
}));

/**![phone](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4NS42IDIzMC4yTDc3OS4xIDEyMy44YTgwLjgzIDgwLjgzIDAgMDAtNTcuMy0yMy44Yy0yMS43IDAtNDIuMSA4LjUtNTcuNCAyMy44TDU0OS44IDIzOC40YTgwLjgzIDgwLjgzIDAgMDAtMjMuOCA1Ny4zYzAgMjEuNyA4LjUgNDIuMSAyMy44IDU3LjRsODMuOCA4My44QTM5My44MiAzOTMuODIgMCAwMTU1My4xIDU1MyAzOTUuMzQgMzk1LjM0IDAgMDE0MzcgNjMzLjhMMzUzLjIgNTUwYTgwLjgzIDgwLjgzIDAgMDAtNTcuMy0yMy44Yy0yMS43IDAtNDIuMSA4LjUtNTcuNCAyMy44TDEyMy44IDY2NC41YTgwLjg5IDgwLjg5IDAgMDAtMjMuOCA1Ny40YzAgMjEuNyA4LjUgNDIuMSAyMy44IDU3LjRsMTA2LjMgMTA2LjNjMjQuNCAyNC41IDU4LjEgMzguNCA5Mi43IDM4LjQgNy4zIDAgMTQuMy0uNiAyMS4yLTEuOCAxMzQuOC0yMi4yIDI2OC41LTkzLjkgMzc2LjQtMjAxLjdDODI4LjIgNjEyLjggODk5LjggNDc5LjIgOTIyLjMgMzQ0YzYuOC00MS4zLTYuOS04My44LTM2LjctMTEzLjh6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(PhoneFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PhoneFilled';
}
var _default = exports.default = RefIcon;