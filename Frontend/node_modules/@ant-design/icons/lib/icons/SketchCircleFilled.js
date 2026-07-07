"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SketchCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SketchCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SketchCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SketchCircleFilled.default
}));

/**![sketch-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU4Mi4zIDYyNS42bDE0Ny45LTE2Ni4zaC02My40em05MC0yMDIuM2g2Mi41bC05Mi4xLTExNS4xem0tMjc0LjcgMzZMNTEyIDY4NC41bDExNC40LTIyNS4yek01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMjg2LjcgMzgwLjJMNTE1LjggNzYyLjNjLTEgMS4xLTIuNCAxLjctMy44IDEuN3MtMi44LS42LTMuOC0xLjdMMjI1LjMgNDQ0LjJhNS4xNCA1LjE0IDAgMDEtLjItNi42TDM2NS42IDI2MmMxLTEuMiAyLjQtMS45IDQtMS45aDI4NC42YzEuNiAwIDMgLjcgNCAxLjlsMTQwLjUgMTc1LjZhNC45IDQuOSAwIDAxMCA2LjZ6bS0xOTAuNS0yMC45TDUxMiAzMjYuMWwtOTYuMiA5Ny4yek00MjAuMyAzMDEuMWwtMjMuMSA4OS44IDg4LjgtODkuOHptMTgzLjQgMEg1MzhsODguOCA4OS44em0tMjIyLjQgNy4xbC05Mi4xIDExNS4xaDYyLjV6bS04Ny41IDE1MS4xbDE0Ny45IDE2Ni4zLTg0LjUtMTY2LjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(SketchCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SketchCircleFilled';
}
var _default = exports.default = RefIcon;