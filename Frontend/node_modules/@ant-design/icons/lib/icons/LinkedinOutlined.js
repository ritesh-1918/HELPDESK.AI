"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LinkedinOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/LinkedinOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const LinkedinOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _LinkedinOutlined.default
}));

/**![linkedin](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg0Ny43IDExMkgxNzYuM2MtMzUuNSAwLTY0LjMgMjguOC02NC4zIDY0LjN2NjcxLjRjMCAzNS41IDI4LjggNjQuMyA2NC4zIDY0LjNoNjcxLjRjMzUuNSAwIDY0LjMtMjguOCA2NC4zLTY0LjNWMTc2LjNjMC0zNS41LTI4LjgtNjQuMy02NC4zLTY0LjN6bTAgNzM2Yy00NDcuOC0uMS02NzEuNy0uMi02NzEuNy0uMy4xLTQ0Ny44LjItNjcxLjcuMy02NzEuNyA0NDcuOC4xIDY3MS43LjIgNjcxLjcuMy0uMSA0NDcuOC0uMiA2NzEuNy0uMyA2NzEuN3pNMjMwLjYgNDExLjloMTE4Ljd2MzgxLjhIMjMwLjZ6bTU5LjQtNTIuMmMzNy45IDAgNjguOC0zMC44IDY4LjgtNjguOGE2OC44IDY4LjggMCAxMC0xMzcuNiAwYy0uMSAzOCAzMC43IDY4LjggNjguOCA2OC44em0yNTIuMyAyNDUuMWMwLTQ5LjggOS41LTk4IDcxLjItOTggNjAuOCAwIDYxLjcgNTYuOSA2MS43IDEwMS4ydjE4NS43aDExOC42VjU4NC4zYzAtMTAyLjgtMjIuMi0xODEuOS0xNDIuMy0xODEuOS01Ny43IDAtOTYuNCAzMS43LTExMi4zIDYxLjdoLTEuNnYtNTIuMkg0MjMuN3YzODEuOGgxMTguNlY2MDQuOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(LinkedinOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'LinkedinOutlined';
}
var _default = exports.default = RefIcon;