"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileTextTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileTextTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileTextTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileTextTwoTone.default
}));

/**![file-text](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUzNCAzNTJWMTM2SDIzMnY3NTJoNTYwVjM5NEg1NzZhNDIgNDIgMCAwMS00Mi00MnptLTIyIDMyMmMwIDQuNC0zLjYgOC04IDhIMzIwYy00LjQgMC04LTMuNi04LTh2LTQ4YzAtNC40IDMuNi04IDgtOGgxODRjNC40IDAgOCAzLjYgOCA4djQ4em0yMDAtMTg0djQ4YzAgNC40LTMuNiA4LTggOEgzMjBjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDM4NGM0LjQgMCA4IDMuNiA4IDh6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik04NTQuNiAyODguNkw2MzkuNCA3My40Yy02LTYtMTQuMS05LjQtMjIuNi05LjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjMxMS4zYzAtOC41LTMuNC0xNi43LTkuNC0yMi43ek02MDIgMTM3LjhMNzkwLjIgMzI2SDYwMlYxMzcuOHpNNzkyIDg4OEgyMzJWMTM2aDMwMnYyMTZhNDIgNDIgMCAwMDQyIDQyaDIxNnY0OTR6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik0zMTIgNDkwdjQ4YzAgNC40IDMuNiA4IDggOGgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMzIwYy00LjQgMC04IDMuNi04IDh6bTE5MiAxMjhIMzIwYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDE4NGM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileTextTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileTextTwoTone';
}
var _default = exports.default = RefIcon;