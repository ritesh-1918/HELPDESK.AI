"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ContactsTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ContactsTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ContactsTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ContactsTwoTone.default
}));

/**![contacts](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ2MC4zIDUyNmE1MS43IDUyIDAgMTAxMDMuNCAwIDUxLjcgNTIgMCAxMC0xMDMuNCAweiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNzY4IDM1MmMwIDQuNC0zLjYgOC04IDhoLTU2Yy00LjQgMC04LTMuNi04LTh2LTU2SDU0OHY1NmMwIDQuNC0zLjYgOC04IDhoLTU2Yy00LjQgMC04LTMuNi04LTh2LTU2SDMyOHY1NmMwIDQuNC0zLjYgOC04IDhoLTU2Yy00LjQgMC04LTMuNi04LTh2LTU2SDEzNnY0OTZoNzUyVjI5Nkg3Njh2NTZ6TTY2MSA3MzZoLTQzLjhjLTQuMiAwLTcuNi0zLjMtNy45LTcuNS0zLjgtNTAuNS00Ni05MC41LTk3LjItOTAuNXMtOTMuNCAzOS45LTk3LjIgOTAuNWMtLjMgNC4yLTMuNyA3LjUtNy45IDcuNWgtNDMuOWE4IDggMCAwMS04LTguNGMyLjgtNTMuMyAzMS45LTk5LjYgNzQuNi0xMjYuMS0xOC4xLTIwLTI5LjEtNDYuNC0yOS4xLTc1LjUgMC02MS45IDQ5LjktMTEyIDExMS40LTExMnMxMTEuNCA1MC4xIDExMS40IDExMmMwIDI5LjEtMTEgNTUuNi0yOS4xIDc1LjUgNDIuNyAyNi40IDcxLjkgNzIuOCA3NC43IDEyNi4xYTggOCAwIDAxLTggOC40eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNTk0LjMgNjAxLjVhMTExLjggMTExLjggMCAwMDI5LjEtNzUuNWMwLTYxLjktNDkuOS0xMTItMTExLjQtMTEycy0xMTEuNCA1MC4xLTExMS40IDExMmMwIDI5LjEgMTEgNTUuNSAyOS4xIDc1LjVhMTU4LjA5IDE1OC4wOSAwIDAwLTc0LjYgMTI2LjEgOCA4IDAgMDA4IDguNEg0MDdjNC4yIDAgNy42LTMuMyA3LjktNy41IDMuOC01MC42IDQ2LTkwLjUgOTcuMi05MC41czkzLjQgNDAgOTcuMiA5MC41Yy4zIDQuMiAzLjcgNy41IDcuOSA3LjVINjYxYTggOCAwIDAwOC04LjRjLTIuOC01My4zLTMyLTk5LjctNzQuNy0xMjYuMXpNNTEyIDU3OGMtMjguNSAwLTUxLjctMjMuMy01MS43LTUyczIzLjItNTIgNTEuNy01MiA1MS43IDIzLjMgNTEuNyA1Mi0yMy4yIDUyLTUxLjcgNTJ6IiBmaWxsPSIjMTY3N2ZmIiAvPjxwYXRoIGQ9Ik05MjggMjI0SDc2OHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDU0OHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDMyOHYtNTZjMC00LjQtMy42LTgtOC04aC01NmMtNC40IDAtOCAzLjYtOCA4djU2SDk2Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY1NzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoODMyYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjI1NmMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQwIDU2OEgxMzZWMjk2aDEyMHY1NmMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04di01NmgxNDh2NTZjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOHYtNTZoMTQ4djU2YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LTh2LTU2aDEyMHY0OTZ6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ContactsTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ContactsTwoTone';
}
var _default = exports.default = RefIcon;