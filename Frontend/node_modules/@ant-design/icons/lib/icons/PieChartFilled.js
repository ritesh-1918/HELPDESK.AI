"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PieChartFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PieChartFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PieChartFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PieChartFilled.default
}));

/**![pie-chart](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2My4xIDUxOC41SDUwNS41VjE2MC45YzAtNC40LTMuNi04LTgtOGgtMjZhMzk4LjU3IDM5OC41NyAwIDAwLTI4Mi41IDExNyAzOTcuNDcgMzk3LjQ3IDAgMDAtODUuNiAxMjdDODIuNiA0NDYuMiA3MiA0OTguNSA3MiA1NTIuNVM4Mi42IDY1OC43IDEwMy40IDcwOGMyMC4xIDQ3LjUgNDguOSA5MC4zIDg1LjYgMTI3IDM2LjcgMzYuNyA3OS40IDY1LjUgMTI3IDg1LjZhMzk2LjY0IDM5Ni42NCAwIDAwMTU1LjYgMzEuNSAzOTguNTcgMzk4LjU3IDAgMDAyODIuNS0xMTdjMzYuNy0zNi43IDY1LjUtNzkuNCA4NS42LTEyN2EzOTYuNjQgMzk2LjY0IDAgMDAzMS41LTE1NS42di0yNmMtLjEtNC40LTMuNy04LTguMS04ek05NTEgNDYzbC0yLjYtMjguMmMtOC41LTkyLTQ5LjMtMTc4LjgtMTE1LjEtMjQ0LjNBMzk4LjUgMzk4LjUgMCAwMDU4OC40IDc1LjZMNTYwLjEgNzNjLTQuNy0uNC04LjcgMy4yLTguNyA3Ljl2MzgzLjdjMCA0LjQgMy42IDggOCA4bDM4My42LTFjNC43LS4xIDguNC00IDgtOC42eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PieChartFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PieChartFilled';
}
var _default = exports.default = RefIcon;