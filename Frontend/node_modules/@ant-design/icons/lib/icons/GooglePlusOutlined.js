"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GooglePlusOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GooglePlusOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GooglePlusOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GooglePlusOutlined.default
}));

/**![google-plus](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3OS41IDQ3MC40Yy0uMy0yNy0uNC01NC4yLS41LTgxLjNoLTgwLjhjLS4zIDI3LS41IDU0LjEtLjcgODEuMy0yNy4yLjEtNTQuMi4zLTgxLjIuNnY4MC45YzI3IC4zIDU0LjIuNSA4MS4yLjguMyAyNyAuMyA1NC4xLjUgODEuMWg4MC45Yy4xLTI3IC4zLTU0LjEuNS04MS4zIDI3LjItLjMgNTQuMi0uNCA4MS4yLS43di04MC45Yy0yNi45LS4yLTU0LjEtLjItODEuMS0uNXptLTUzMCAuNGMtLjEgMzIuMyAwIDY0LjcuMSA5NyA1NC4yIDEuOCAxMDguNSAxIDE2Mi43IDEuOC0yMy45IDEyMC4zLTE4Ny40IDE1OS4zLTI3My45IDgwLjctODktNjguOS04NC44LTIyMCA3LjctMjg0IDY0LjctNTEuNiAxNTYuNi0zOC45IDIyMS4zIDUuOCAyNS40LTIzLjUgNDkuMi00OC43IDcyLjEtNzQuNy01My44LTQyLjktMTE5LjgtNzMuNS0xOTAtNzAuMy0xNDYuNi00LjktMjgxLjMgMTIzLjUtMjgzLjcgMjcwLjItOS40IDExOS45IDY5LjQgMjM3LjQgMTgwLjYgMjc5LjggMTEwLjggNDIuNyAyNTIuOSAxMy42IDMyMy43LTg2IDQ2LjctNjIuOSA1Ni44LTE0My45IDUxLjMtMjIwLTkwLjctLjctMTgxLjMtLjYtMjcxLjktLjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(GooglePlusOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GooglePlusOutlined';
}
var _default = exports.default = RefIcon;