"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ContactsOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ContactsOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ContactsOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ContactsOutlined.default
}));

/**![contacts](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5NC4zIDYwMS41YTExMS44IDExMS44IDAgMDAyOS4xLTc1LjVjMC02MS45LTQ5LjktMTEyLTExMS40LTExMnMtMTExLjQgNTAuMS0xMTEuNCAxMTJjMCAyOS4xIDExIDU1LjUgMjkuMSA3NS41YTE1OC4wOSAxNTguMDkgMCAwMC03NC42IDEyNi4xIDggOCAwIDAwOCA4LjRINDA3YzQuMiAwIDcuNi0zLjMgNy45LTcuNSAzLjgtNTAuNiA0Ni05MC41IDk3LjItOTAuNXM5My40IDQwIDk3LjIgOTAuNWMuMyA0LjIgMy43IDcuNSA3LjkgNy41SDY2MWE4IDggMCAwMDgtOC40Yy0yLjgtNTMuMy0zMi05OS43LTc0LjctMTI2LjF6TTUxMiA1NzhjLTI4LjUgMC01MS43LTIzLjMtNTEuNy01MnMyMy4yLTUyIDUxLjctNTIgNTEuNyAyMy4zIDUxLjcgNTItMjMuMiA1Mi01MS43IDUyem00MTYtMzU0SDc2OHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDU0OHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDMyOHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDk2Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY1NzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoODMyYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjI1NmMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQwIDU2OEgxMzZWMjk2aDEyMHY1NmMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04di01NmgxNDh2NTZjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOHYtNTZoMTQ4djU2YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LTh2LTU2aDEyMHY0OTZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ContactsOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ContactsOutlined';
}
var _default = exports.default = RefIcon;