"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MoneyCollectOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MoneyCollectOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MoneyCollectOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MoneyCollectOutlined.default
}));

/**![money-collect](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkxMS41IDcwMC43YTggOCAwIDAwLTEwLjMtNC44TDg0MCA3MTguMlYxODBjMC0zNy42LTMwLjQtNjgtNjgtNjhIMjUyYy0zNy42IDAtNjggMzAuNC02OCA2OHY1MzguMmwtNjEuMy0yMi4zYy0uOS0uMy0xLjgtLjUtMi43LS41LTQuNCAwLTggMy42LTggOFY3NjNjMCAzLjMgMi4xIDYuMyA1LjMgNy41TDUwMSA5MTAuMWM3LjEgMi42IDE0LjggMi42IDIxLjkgMGwzODMuOC0xMzkuNWMzLjItMS4yIDUuMy00LjIgNS4zLTcuNXYtNTkuNmMwLTEtLjItMS45LS41LTIuOHpNNTEyIDgzNy41bC0yNTYtOTMuMVYxODRoNTEydjU2MC40bC0yNTYgOTMuMXpNNjYwLjYgMzEyaC01NC41Yy0zIDAtNS44IDEuNy03LjEgNC40bC04NC43IDE2OC44SDUxMWwtODQuNy0xNjguOGE4IDggMCAwMC03LjEtNC40aC01NS43Yy0xLjMgMC0yLjYuMy0zLjggMS0zLjkgMi4xLTUuMyA3LTMuMiAxMC44bDEwMy45IDE5MS42aC01N2MtNC40IDAtOCAzLjYtOCA4djI3LjFjMCA0LjQgMy42IDggOCA4aDc2djM5aC03NmMtNC40IDAtOCAzLjYtOCA4djI3LjFjMCA0LjQgMy42IDggOCA4aDc2VjcwNGMwIDQuNCAzLjYgOCA4IDhoNDkuOWM0LjQgMCA4LTMuNiA4LTh2LTYzLjVoNzYuM2M0LjQgMCA4LTMuNiA4LTh2LTI3LjFjMC00LjQtMy42LTgtOC04aC03Ni4zdi0zOWg3Ni4zYzQuNCAwIDgtMy42IDgtOHYtMjcuMWMwLTQuNC0zLjYtOC04LThINTY0bDEwMy43LTE5MS42Yy42LTEuMiAxLTIuNSAxLTMuOC0uMS00LjMtMy43LTcuOS04LjEtNy45eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(MoneyCollectOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MoneyCollectOutlined';
}
var _default = exports.default = RefIcon;