"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _InsertRowAboveOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/InsertRowAboveOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const InsertRowAboveOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _InsertRowAboveOutlined.default
}));

/**![insert-row-above](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik04NzguNyAzMzZIMTQ1LjNjLTE4LjQgMC0zMy4zIDE0LjMtMzMuMyAzMnY0NjRjMCAxNy43IDE0LjkgMzIgMzMuMyAzMmg3MzMuM2MxOC40IDAgMzMuMy0xNC4zIDMzLjMtMzJWMzY4Yy4xLTE3LjctMTQuOC0zMi0zMy4yLTMyek0zNjAgNzkySDE4NFY2MzJoMTc2djE2MHptMC0yMjRIMTg0VjQwOGgxNzZ2MTYwem0yNDAgMjI0SDQyNFY2MzJoMTc2djE2MHptMC0yMjRINDI0VjQwOGgxNzZ2MTYwem0yNDAgMjI0SDY2NFY2MzJoMTc2djE2MHptMC0yMjRINjY0VjQwOGgxNzZ2MTYwem02NC00MDhIMTIwYy00LjQgMC04IDMuNi04IDh2ODBjMCA0LjQgMy42IDggOCA4aDc4NGM0LjQgMCA4LTMuNiA4LTh2LTgwYzAtNC40LTMuNi04LTgtOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(InsertRowAboveOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'InsertRowAboveOutlined';
}
var _default = exports.default = RefIcon;