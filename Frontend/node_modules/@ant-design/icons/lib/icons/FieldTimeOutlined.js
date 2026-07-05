"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FieldTimeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FieldTimeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FieldTimeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FieldTimeOutlined.default
}));

/**![field-time](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik05NDUgNDEySDY4OWMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgyNTZjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6TTgxMSA1NDhINjg5Yy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4aDEyMmM0LjQgMCA4LTMuNiA4LTh2LTQ4YzAtNC40LTMuNi04LTgtOHpNNDc3LjMgMzIyLjVINDM0Yy02LjIgMC0xMS4yIDUtMTEuMiAxMS4ydjI0OGMwIDMuNiAxLjcgNi45IDQuNiA5bDE0OC45IDEwOC42YzUgMy42IDEyIDIuNiAxNS42LTIuNGwyNS43LTM1LjF2LS4xYzMuNi01IDIuNS0xMi0yLjUtMTUuNmwtMTI2LjctOTEuNlYzMzMuN2MuMS02LjItNS0xMS4yLTExLjEtMTEuMnoiIC8+PHBhdGggZD0iTTgwNC44IDY3My45SDc0N2MtNS42IDAtMTAuOSAyLjktMTMuOSA3LjdhMzIxIDMyMSAwIDAxLTQ0LjUgNTUuNyAzMTcuMTcgMzE3LjE3IDAgMDEtMTAxLjMgNjguM2MtMzkuMyAxNi42LTgxIDI1LTEyNCAyNS00My4xIDAtODQuOC04LjQtMTI0LTI1LTM3LjktMTYtNzItMzktMTAxLjMtNjguM3MtNTIuMy02My40LTY4LjMtMTAxLjNjLTE2LjYtMzkuMi0yNS04MC45LTI1LTEyNCAwLTQzLjEgOC40LTg0LjcgMjUtMTI0IDE2LTM3LjkgMzktNzIgNjguMy0xMDEuMyAyOS4zLTI5LjMgNjMuNC01Mi4zIDEwMS4zLTY4LjMgMzkuMi0xNi42IDgxLTI1IDEyNC0yNSA0My4xIDAgODQuOCA4LjQgMTI0IDI1IDM3LjkgMTYgNzIgMzkgMTAxLjMgNjguM2EzMjEgMzIxIDAgMDE0NC41IDU1LjdjMyA0LjggOC4zIDcuNyAxMy45IDcuN2g1Ny44YzYuOSAwIDExLjMtNy4yIDguMi0xMy4zLTY1LjItMTI5LjctMTk3LjQtMjE0LTM0NS0yMTUuNy0yMTYuMS0yLjctMzk1LjYgMTc0LjItMzk2IDM5MC4xQzcxLjYgNzI3LjUgMjQ2LjkgOTAzIDQ2My4yIDkwM2MxNDkuNSAwIDI4My45LTg0LjYgMzQ5LjgtMjE1LjhhOS4xOCA5LjE4IDAgMDAtOC4yLTEzLjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FieldTimeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FieldTimeOutlined';
}
var _default = exports.default = RefIcon;