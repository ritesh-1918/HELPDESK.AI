"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SlidersFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SlidersFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SlidersFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SlidersFilled.default
}));

/**![sliders](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkwNCAyOTZoLTY2di05NmMwLTQuNC0zLjYtOC04LThoLTUyYy00LjQgMC04IDMuNi04IDh2OTZoLTY2Yy00LjQgMC04IDMuNi04IDh2NDE2YzAgNC40IDMuNiA4IDggOGg2NnY5NmMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04di05Nmg2NmM0LjQgMCA4LTMuNiA4LThWMzA0YzAtNC40LTMuNi04LTgtOHptLTU4NC03MmgtNjZ2LTU2YzAtNC40LTMuNi04LTgtOGgtNTJjLTQuNCAwLTggMy42LTggOHY1NmgtNjZjLTQuNCAwLTggMy42LTggOHY1NjBjMCA0LjQgMy42IDggOCA4aDY2djU2YzAgNC40IDMuNiA4IDggOGg1MmM0LjQgMCA4LTMuNiA4LTh2LTU2aDY2YzQuNCAwIDgtMy42IDgtOFYyMzJjMC00LjQtMy42LTgtOC04em0yOTIgMTgwaC02NlYyMzJjMC00LjQtMy42LTgtOC04aC01MmMtNC40IDAtOCAzLjYtOCA4djE3MmgtNjZjLTQuNCAwLTggMy42LTggOHYyMDBjMCA0LjQgMy42IDggOCA4aDY2djE3MmMwIDQuNCAzLjYgOCA4IDhoNTJjNC40IDAgOC0zLjYgOC04VjYyMGg2NmM0LjQgMCA4LTMuNiA4LThWNDEyYzAtNC40LTMuNi04LTgtOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(SlidersFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SlidersFilled';
}
var _default = exports.default = RefIcon;