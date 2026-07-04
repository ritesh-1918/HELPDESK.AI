"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MenuFoldOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MenuFoldOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MenuFoldOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MenuFoldOutlined.default
}));

/**![menu-fold](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQwOCA0NDJoNDgwYzQuNCAwIDgtMy42IDgtOHYtNTZjMC00LjQtMy42LTgtOC04SDQwOGMtNC40IDAtOCAzLjYtOCA4djU2YzAgNC40IDMuNiA4IDggOHptLTggMjA0YzAgNC40IDMuNiA4IDggOGg0ODBjNC40IDAgOC0zLjYgOC04di01NmMwLTQuNC0zLjYtOC04LThINDA4Yy00LjQgMC04IDMuNi04IDh2NTZ6bTUwNC00ODZIMTIwYy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDc4NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHptMCA2MzJIMTIwYy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDc4NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHpNMTE1LjQgNTE4LjlMMjcxLjcgNjQyYzUuOCA0LjYgMTQuNC41IDE0LjQtNi45VjM4OC45YzAtNy40LTguNS0xMS41LTE0LjQtNi45TDExNS40IDUwNS4xYTguNzQgOC43NCAwIDAwMCAxMy44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(MenuFoldOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MenuFoldOutlined';
}
var _default = exports.default = RefIcon;