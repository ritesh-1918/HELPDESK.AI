"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _QuestionOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/QuestionOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const QuestionOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _QuestionOutlined.default
}));

/**![question](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc2NCAyODAuOWMtMTQtMzAuNi0zMy45LTU4LjEtNTkuMy04MS42QzY1My4xIDE1MS40IDU4NC42IDEyNSA1MTIgMTI1cy0xNDEuMSAyNi40LTE5Mi43IDc0LjJjLTI1LjQgMjMuNi00NS4zIDUxLTU5LjMgODEuNy0xNC42IDMyLTIyIDY1LjktMjIgMTAwLjl2MjdjMCA2LjIgNSAxMS4yIDExLjIgMTEuMmg1NGM2LjIgMCAxMS4yLTUgMTEuMi0xMS4ydi0yN2MwLTk5LjUgODguNi0xODAuNCAxOTcuNi0xODAuNHMxOTcuNiA4MC45IDE5Ny42IDE4MC40YzAgNDAuOC0xNC41IDc5LjItNDIgMTExLjItMjcuMiAzMS43LTY1LjYgNTQuNC0xMDguMSA2NC0yNC4zIDUuNS00Ni4yIDE5LjItNjEuNyAzOC44YTExMC44NSAxMTAuODUgMCAwMC0yMy45IDY4LjZ2MzEuNGMwIDYuMiA1IDExLjIgMTEuMiAxMS4yaDU0YzYuMiAwIDExLjItNSAxMS4yLTExLjJ2LTMxLjRjMC0xNS43IDEwLjktMjkuNSAyNi0zMi45IDU4LjQtMTMuMiAxMTEuNC00NC43IDE0OS4zLTg4LjcgMTkuMS0yMi4zIDM0LTQ3LjEgNDQuMy03NCAxMC43LTI3LjkgMTYuMS01Ny4yIDE2LjEtODcgMC0zNS03LjQtNjktMjItMTAwLjl6TTUxMiA3ODdjLTMwLjkgMC01NiAyNS4xLTU2IDU2czI1LjEgNTYgNTYgNTYgNTYtMjUuMSA1Ni01Ni0yNS4xLTU2LTU2LTU2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(QuestionOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'QuestionOutlined';
}
var _default = exports.default = RefIcon;