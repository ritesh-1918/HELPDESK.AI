"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ScheduleTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ScheduleTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ScheduleTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ScheduleTwoTone.default
}));

/**![schedule](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTc2OCAzNTJjMCA0LjQtMy42IDgtOCA4aC01NmMtNC40IDAtOC0zLjYtOC04di01Nkg1NDh2NTZjMCA0LjQtMy42IDgtOCA4aC01NmMtNC40IDAtOC0zLjYtOC04di01NkgzMjh2NTZjMCA0LjQtMy42IDgtOCA4aC01NmMtNC40IDAtOC0zLjYtOC04di01NkgxMzZ2NDk2aDc1MlYyOTZINzY4djU2ek00MjQgNjg4YzAgNC40LTMuNiA4LTggOEgyMzJjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDE4NGM0LjQgMCA4IDMuNiA4IDh2NDh6bTAtMTM2YzAgNC40LTMuNiA4LTggOEgyMzJjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDE4NGM0LjQgMCA4IDMuNiA4IDh2NDh6bTM3NC40LTkxLjJsLTE2NSAyMjguN2ExNS45IDE1LjkgMCAwMS0yNS44IDBMNDkzLjUgNTMxLjNjLTMuOC01LjMgMC0xMi43IDYuNS0xMi43aDU0LjljNS4xIDAgOS45IDIuNCAxMi45IDYuNmw1Mi44IDczLjEgMTAzLjYtMTQzLjdjMy00LjEgNy44LTYuNiAxMi44LTYuNWg1NC45YzYuNSAwIDEwLjMgNy40IDYuNSAxMi43eiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNNzI0LjIgNDU0LjZMNjIwLjYgNTk4LjNsLTUyLjgtNzMuMWMtMy00LjItNy44LTYuNi0xMi45LTYuNkg1MDBjLTYuNSAwLTEwLjMgNy40LTYuNSAxMi43bDExNC4xIDE1OC4yYTE1LjkgMTUuOSAwIDAwMjUuOCAwbDE2NS0yMjguN2MzLjgtNS4zIDAtMTIuNy02LjUtMTIuN0g3MzdjLTUtLjEtOS44IDIuNC0xMi44IDYuNXpNNDE2IDQ5NkgyMzJjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04eiIgZmlsbD0iIzE2NzdmZiIgLz48cGF0aCBkPSJNOTI4IDIyNEg3Njh2LTU2YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY1Nkg1NDh2LTU2YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY1NkgzMjh2LTU2YzAtNC40LTMuNi04LTgtOGgtNTZjLTQuNCAwLTggMy42LTggOHY1Nkg5NmMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NTc2YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDgzMmMxNy43IDAgMzItMTQuMyAzMi0zMlYyNTZjMC0xNy43LTE0LjMtMzItMzItMzJ6bS00MCA1NjhIMTM2VjI5NmgxMjB2NTZjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOHYtNTZoMTQ4djU2YzAgNC40IDMuNiA4IDggOGg1NmM0LjQgMCA4LTMuNiA4LTh2LTU2aDE0OHY1NmMwIDQuNCAzLjYgOCA4IDhoNTZjNC40IDAgOC0zLjYgOC04di01NmgxMjB2NDk2eiIgZmlsbD0iIzE2NzdmZiIgLz48cGF0aCBkPSJNNDE2IDYzMkgyMzJjLTQuNCAwLTggMy42LTggOHY0OGMwIDQuNCAzLjYgOCA4IDhoMTg0YzQuNCAwIDgtMy42IDgtOHYtNDhjMC00LjQtMy42LTgtOC04eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(ScheduleTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ScheduleTwoTone';
}
var _default = exports.default = RefIcon;