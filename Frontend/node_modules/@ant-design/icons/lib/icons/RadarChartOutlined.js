"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RadarChartOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RadarChartOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RadarChartOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RadarChartOutlined.default
}));

/**![radar-chart](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNi44IDM5Ny4xbC0zOTYtMjg4YTMxLjgxIDMxLjgxIDAgMDAtMzcuNiAwbC0zOTYgMjg4YTMxLjk5IDMxLjk5IDAgMDAtMTEuNiAzNS44bDE1MS4zIDQ2NmEzMiAzMiAwIDAwMzAuNCAyMi4xaDQ4OS41YzEzLjkgMCAyNi4xLTguOSAzMC40LTIyLjFsMTUxLjMtNDY2YzQuMi0xMy4yLS41LTI3LjYtMTEuNy0zNS44ek04MzguNiA0MTdsLTk4LjUgMzItMjAwLTE0NC43VjE5OS45TDgzOC42IDQxN3pNNDY2IDU2Ny4ybC04OS4xIDEyMi4zLTU1LjItMTY5LjJMNDY2IDU2Ny4yem0tMTE2LjMtOTYuOEw0ODQgMzczLjN2MTQwLjhsLTEzNC4zLTQzLjd6TTUxMiA1OTkuMmw5My45IDEyOC45SDQxOC4xTDUxMiA1OTkuMnptMjguMS0yMjUuOWwxMzQuMiA5Ny4xTDU0MC4xIDUxNFYzNzMuM3pNNTU4IDU2Ny4ybDE0NC4zLTQ2LjktNTUuMiAxNjkuMkw1NTggNTY3LjJ6bS03NC0zNjcuM3YxMDQuNEwyODMuOSA0NDlsLTk4LjUtMzJMNDg0IDE5OS45ek0xNjkuMyA0NzAuOGw4Ni41IDI4LjEgODAuNCAyNDYuNC01My44IDczLjktMTEzLjEtMzQ4LjR6TTMyNy4xIDg1M2w1MC4zLTY5aDI2OS4zbDUwLjMgNjlIMzI3LjF6bTQxNC41LTMzLjhsLTUzLjgtNzMuOSA4MC40LTI0Ni40IDg2LjUtMjguMS0xMTMuMSAzNDguNHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(RadarChartOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RadarChartOutlined';
}
var _default = exports.default = RefIcon;