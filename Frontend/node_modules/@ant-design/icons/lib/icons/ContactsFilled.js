"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ContactsFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ContactsFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ContactsFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ContactsFilled.default
}));

/**![contacts](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAyMjRINzY4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZINTQ4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZIMzI4di01NmMwLTQuNC0zLjYtOC04LThoLTU2Yy00LjQgMC04IDMuNi04IDh2NTZIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjU3NmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMjU2YzAtMTcuNy0xNC4zLTMyLTMyLTMyek02NjEgNzM2aC00My45Yy00LjIgMC03LjYtMy4zLTcuOS03LjUtMy44LTUwLjYtNDYtOTAuNS05Ny4yLTkwLjVzLTkzLjQgNDAtOTcuMiA5MC41Yy0uMyA0LjItMy43IDcuNS03LjkgNy41SDM2M2E4IDggMCAwMS04LTguNGMyLjgtNTMuMyAzMi05OS43IDc0LjYtMTI2LjFhMTExLjggMTExLjggMCAwMS0yOS4xLTc1LjVjMC02MS45IDQ5LjktMTEyIDExMS40LTExMiA2MS41IDAgMTExLjQgNTAuMSAxMTEuNCAxMTIgMCAyOS4xLTExIDU1LjUtMjkuMSA3NS41IDQyLjcgMjYuNSA3MS44IDcyLjggNzQuNiAxMjYuMS40IDQuNi0zLjIgOC40LTcuOCA4LjR6TTUxMiA0NzRjLTI4LjUgMC01MS43IDIzLjMtNTEuNyA1MnMyMy4yIDUyIDUxLjcgNTJjMjguNSAwIDUxLjctMjMuMyA1MS43LTUycy0yMy4yLTUyLTUxLjctNTJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ContactsFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ContactsFilled';
}
var _default = exports.default = RefIcon;