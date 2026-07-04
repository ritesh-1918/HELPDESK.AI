"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GoogleSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GoogleSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GoogleSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GoogleSquareFilled.default
}));

/**![google-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNjc5IDY5Ny42QzYzOC40IDczNSA1ODMgNzU3IDUxNi45IDc1N2MtOTUuNyAwLTE3OC41LTU0LjktMjE4LjgtMTM0LjlBMjQ1LjAyIDI0NS4wMiAwIDAxMjcyIDUxMmMwLTM5LjYgOS41LTc3IDI2LjEtMTEwLjEgNDAuMy04MC4xIDEyMy4xLTEzNSAyMTguOC0xMzUgNjYgMCAxMjEuNCAyNC4zIDE2My45IDYzLjhMNjEwLjYgNDAxYy0yNS40LTI0LjMtNTcuNy0zNi42LTkzLjYtMzYuNi02My44IDAtMTE3LjggNDMuMS0xMzcuMSAxMDEtNC45IDE0LjctNy43IDMwLjQtNy43IDQ2LjZzMi44IDMxLjkgNy43IDQ2LjZjMTkuMyA1Ny45IDczLjMgMTAxIDEzNyAxMDEgMzMgMCA2MS04LjcgODIuOS0yMy40IDI2LTE3LjQgNDMuMi00My4zIDQ4LjktNzRINTE2Ljl2LTk0LjhoMjMwLjdjMi45IDE2LjEgNC40IDMyLjggNC40IDUwLjEgMCA3NC43LTI2LjcgMTM3LjQtNzMgMTgwLjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(GoogleSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GoogleSquareFilled';
}
var _default = exports.default = RefIcon;