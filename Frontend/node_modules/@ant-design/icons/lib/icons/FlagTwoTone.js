"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FlagTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FlagTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FlagTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FlagTwoTone.default
}));

/**![flag](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE4NCAyMzJoMzY4djMzNkgxODR6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik02MjQgNjMyYzAgNC40LTMuNiA4LTggOEg1MDR2NzNoMzM2VjM3N0g2MjR2MjU1eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODgwIDMwNUg2MjRWMTkyYzAtMTcuNy0xNC4zLTMyLTMyLTMySDE4NHYtNDBjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djc4NGMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04VjY0MGgyNDh2MTEzYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDQxNmMxNy43IDAgMzItMTQuMyAzMi0zMlYzMzdjMC0xNy43LTE0LjMtMzItMzItMzJ6TTE4NCA1NjhWMjMyaDM2OHYzMzZIMTg0em02NTYgMTQ1SDUwNHYtNzNoMTEyYzQuNCAwIDgtMy42IDgtOFYzNzdoMjE2djMzNnoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FlagTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FlagTwoTone';
}
var _default = exports.default = RefIcon;