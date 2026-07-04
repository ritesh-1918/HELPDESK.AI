"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _HomeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/HomeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const HomeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _HomeOutlined.default
}));

/**![home](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTk0Ni41IDUwNUw1NjAuMSAxMTguOGwtMjUuOS0yNS45YTMxLjUgMzEuNSAwIDAwLTQ0LjQgMEw3Ny41IDUwNWE2My45IDYzLjkgMCAwMC0xOC44IDQ2Yy40IDM1LjIgMjkuNyA2My4zIDY0LjkgNjMuM2g0Mi41Vjk0MGg2OTEuOFY2MTQuM2g0My40YzE3LjEgMCAzMy4yLTYuNyA0NS4zLTE4LjhhNjMuNiA2My42IDAgMDAxOC43LTQ1LjNjMC0xNy02LjctMzMuMS0xOC44LTQ1LjJ6TTU2OCA4NjhINDU2VjY2NGgxMTJ2MjA0em0yMTcuOS0zMjUuN1Y4NjhINjMyVjY0MGMwLTIyLjEtMTcuOS00MC00MC00MEg0MzJjLTIyLjEgMC00MCAxNy45LTQwIDQwdjIyOEgyMzguMVY1NDIuM2gtOTZsMzcwLTM2OS43IDIzLjEgMjMuMUw4ODIgNTQyLjNoLTk2LjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(HomeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'HomeOutlined';
}
var _default = exports.default = RefIcon;