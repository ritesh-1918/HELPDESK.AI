"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BoxPlotOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BoxPlotOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BoxPlotOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BoxPlotOutlined.default
}));

/**![box-plot](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTk1MiAyMjRoLTUyYy00LjQgMC04IDMuNi04IDh2MjQ4aC05MlYzMDRjMC00LjQtMy42LTgtOC04SDIzMmMtNC40IDAtOCAzLjYtOCA4djE3NmgtOTJWMjMyYzAtNC40LTMuNi04LTgtOEg3MmMtNC40IDAtOCAzLjYtOCA4djU2MGMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04VjU0OGg5MnYxNzJjMCA0LjQgMy42IDggOCA4aDU2MGM0LjQgMCA4LTMuNiA4LThWNTQ4aDkydjI0NGMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04VjIzMmMwLTQuNC0zLjYtOC04LTh6TTI5NiAzNjhoODh2Mjg4aC04OFYzNjh6bTQzMiAyODhINDQ4VjM2OGgyODB2Mjg4eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(BoxPlotOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BoxPlotOutlined';
}
var _default = exports.default = RefIcon;