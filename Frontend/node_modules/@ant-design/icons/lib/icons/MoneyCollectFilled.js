"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MoneyCollectFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MoneyCollectFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MoneyCollectFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MoneyCollectFilled.default
}));

/**![money-collect](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkxMS41IDY5OS43YTggOCAwIDAwLTEwLjMtNC44TDg0MCA3MTcuMlYxNzljMC0zNy42LTMwLjQtNjgtNjgtNjhIMjUyYy0zNy42IDAtNjggMzAuNC02OCA2OHY1MzguMmwtNjEuMy0yMi4zYy0uOS0uMy0xLjgtLjUtMi43LS41LTQuNCAwLTggMy42LTggOFY3NjJjMCAzLjMgMi4xIDYuMyA1LjMgNy41TDUwMSA5MDkuMWM3LjEgMi42IDE0LjggMi42IDIxLjkgMGwzODMuOC0xMzkuNWMzLjItMS4yIDUuMy00LjIgNS4zLTcuNXYtNTkuNmMwLTEtLjItMS45LS41LTIuOHptLTI0My44LTM3N0w1NjQgNTE0LjNoNTcuNmM0LjQgMCA4IDMuNiA4IDh2MjcuMWMwIDQuNC0zLjYgOC04IDhoLTc2LjN2MzloNzYuM2M0LjQgMCA4IDMuNiA4IDh2MjcuMWMwIDQuNC0zLjYgOC04IDhoLTc2LjNWNzAzYzAgNC40LTMuNiA4LTggOGgtNDkuOWMtNC40IDAtOC0zLjYtOC04di02My40aC03NmMtNC40IDAtOC0zLjYtOC04di0yNy4xYzAtNC40IDMuNi04IDgtOGg3NnYtMzloLTc2Yy00LjQgMC04LTMuNi04LTh2LTI3LjFjMC00LjQgMy42LTggOC04aDU3TDM1Ni41IDMyMi44Yy0yLjEtMy44LS43LTguNyAzLjItMTAuOCAxLjItLjcgMi41LTEgMy44LTFoNTUuN2E4IDggMCAwMTcuMSA0LjRMNTExIDQ4NC4yaDMuM0w1OTkgMzE1LjRjMS4zLTIuNyA0LjEtNC40IDcuMS00LjRoNTQuNWM0LjQgMCA4IDMuNiA4LjEgNy45IDAgMS4zLS40IDIuNi0xIDMuOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(MoneyCollectFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MoneyCollectFilled';
}
var _default = exports.default = RefIcon;