"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ClusterOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ClusterOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ClusterOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ClusterOutlined.default
}));

/**![cluster](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4OCA2ODBoLTU0VjU0MEg1NDZ2LTkyaDIzOGM4LjggMCAxNi03LjIgMTYtMTZWMTY4YzAtOC44LTcuMi0xNi0xNi0xNkgyNDBjLTguOCAwLTE2IDcuMi0xNiAxNnYyNjRjMCA4LjggNy4yIDE2IDE2IDE2aDIzOHY5MkgxOTB2MTQwaC01NGMtNC40IDAtOCAzLjYtOCA4djE3NmMwIDQuNCAzLjYgOCA4IDhoMTc2YzQuNCAwIDgtMy42IDgtOFY2ODhjMC00LjQtMy42LTgtOC04aC01NHYtNzJoMjIwdjcyaC01NGMtNC40IDAtOCAzLjYtOCA4djE3NmMwIDQuNCAzLjYgOCA4IDhoMTc2YzQuNCAwIDgtMy42IDgtOFY2ODhjMC00LjQtMy42LTgtOC04aC01NHYtNzJoMjIwdjcyaC01NGMtNC40IDAtOCAzLjYtOCA4djE3NmMwIDQuNCAzLjYgOCA4IDhoMTc2YzQuNCAwIDgtMy42IDgtOFY2ODhjMC00LjQtMy42LTgtOC04ek0yNTYgODA1LjNjMCAxLjUtMS4yIDIuNy0yLjcgMi43aC01OC43Yy0xLjUgMC0yLjctMS4yLTIuNy0yLjd2LTU4LjdjMC0xLjUgMS4yLTIuNyAyLjctMi43aDU4LjdjMS41IDAgMi43IDEuMiAyLjcgMi43djU4Ljd6bTI4OCAwYzAgMS41LTEuMiAyLjctMi43IDIuN2gtNTguN2MtMS41IDAtMi43LTEuMi0yLjctMi43di01OC43YzAtMS41IDEuMi0yLjcgMi43LTIuN2g1OC43YzEuNSAwIDIuNyAxLjIgMi43IDIuN3Y1OC43ek0yODggMzg0VjIxNmg0NDh2MTY4SDI4OHptNTQ0IDQyMS4zYzAgMS41LTEuMiAyLjctMi43IDIuN2gtNTguN2MtMS41IDAtMi43LTEuMi0yLjctMi43di01OC43YzAtMS41IDEuMi0yLjcgMi43LTIuN2g1OC43YzEuNSAwIDIuNyAxLjIgMi43IDIuN3Y1OC43ek0zNjAgMzAwYTQwIDQwIDAgMTA4MCAwIDQwIDQwIDAgMTAtODAgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ClusterOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ClusterOutlined';
}
var _default = exports.default = RefIcon;