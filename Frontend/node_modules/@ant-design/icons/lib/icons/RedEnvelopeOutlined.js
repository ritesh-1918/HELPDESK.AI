"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RedEnvelopeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RedEnvelopeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RedEnvelopeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RedEnvelopeOutlined.default
}));

/**![red-envelope](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ0MC42IDQ2Mi42YTguMzggOC4zOCAwIDAwLTcuNS00LjZoLTQ4LjhjLTEuMyAwLTIuNi40LTMuOSAxYTguNCA4LjQgMCAwMC0zLjQgMTEuNGw4Ny40IDE2MS4xSDQxOWMtNC42IDAtOC40IDMuOC04LjQgOC40VjY2NWMwIDQuNiAzLjggOC40IDguNCA4LjRoNjNWNzAyaC02M2MtNC42IDAtOC40IDMuOC04LjQgOC40djI1LjFjMCA0LjYgMy44IDguNCA4LjQgOC40aDYzdjQ5LjljMCA0LjYgMy44IDguNCA4LjQgOC40aDQzLjdjNC42IDAgOC40LTMuOCA4LjQtOC40di00OS45aDYzLjNjNC43IDAgOC40LTMuOCA4LjItOC41di0yNWMwLTQuNi0zLjgtOC40LTguNC04LjRoLTYzLjN2LTI4LjZoNjMuM2M0LjYgMCA4LjQtMy44IDguNC04LjR2LTI1LjFjMC00LjYtMy44LTguNC04LjQtOC40aC00NS45bDg3LjItMTYxYTguNDUgOC40NSAwIDAwLTcuNC0xMi40aC00Ny44Yy0zLjEgMC02IDEuOC03LjUgNC42bC03MS45IDE0MS45LTcxLjctMTQyek04MzIgNjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjk2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgODI0SDIzMlYxOTMuMWwyNjAuMyAyMDQuMWMxMS42IDkuMSAyNy45IDkuMSAzOS41IDBMNzkyIDE5My4xVjg4OHptMC03NTEuM2gtMzEuN0w1MTIgMzMxLjMgMjYzLjcgMTM2LjdIMjMydi0uN2g1NjB2Ljd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(RedEnvelopeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RedEnvelopeOutlined';
}
var _default = exports.default = RefIcon;