"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PinterestOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PinterestOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PinterestOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PinterestOutlined.default
}));

/**![pinterest](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTEyIDY0QzI2NC44IDY0IDY0IDI2NC44IDY0IDUxMnMyMDAuOCA0NDggNDQ4IDQ0OCA0NDgtMjAwLjggNDQ4LTQ0OFM3NTkuMiA2NCA1MTIgNjRtMCAzOC45NmMyMjYuMTQgMCA0MDkuMDQgMTgyLjkgNDA5LjA0IDQwOS4wNCAwIDIyNi4xNC0xODIuOSA0MDkuMDQtNDA5LjA0IDQwOS4wNC00MS4zNyAwLTgxLjI3LTYuMTktMTE4Ljg5LTE3LjU3IDE2Ljc2LTI4LjAyIDM4LjQtNjguMDYgNDYuOTktMTAxLjEyIDUuMS0xOS42IDI2LjEtOTkuNTYgMjYuMS05OS41NiAxMy42NCAyNi4wNCA1My41IDQ4LjA5IDk1Ljk0IDQ4LjA5IDEyNi4zIDAgMjE3LjM0LTExNi4xNSAyMTcuMzQtMjYwLjQ5IDAtMTM4LjM3LTExMi45MS0yNDEuODgtMjU4LjItMjQxLjg4LTE4MC43NSAwLTI3Ni42OSAxMjEuMzItMjc2LjY5IDI1My40IDAgNjEuNDQgMzIuNjggMTM3LjkxIDg1IDE2Mi4yNiA3LjkyIDMuNyAxMi4xNyAyLjEgMTQtNS41OSAxLjQtNS44MyA4LjQ2LTM0LjI1IDExLjYzLTQ3LjQ4IDEuMDItNC4yMi41My03Ljg2LTIuODktMTIuMDItMTcuMzEtMjEtMzEuMi01OS41OC0zMS4yLTk1LjU2IDAtOTIuMzggNjkuOTQtMTgxLjc4IDE4OS4wOC0xODEuNzggMTAyLjg4IDAgMTc0LjkzIDcwLjEzIDE3NC45MyAxNzAuNCAwIDExMy4yOC01Ny4yIDE5MS43OC0xMzEuNjMgMTkxLjc4LTQxLjExIDAtNzEuODktMzQtNjIuMDItNzUuNyAxMS44NC00OS43OCAzNC43LTEwMy40OSAzNC43LTEzOS40NCAwLTMyLjE1LTE3LjI1LTU4Ljk3LTUzLTU4Ljk3LTQyLjAyIDAtNzUuNzggNDMuNDUtNzUuNzggMTAxLjcgMCAzNy4wNiAxMi41NiA2Mi4xNiAxMi41NiA2Mi4xNnMtNDEuNTEgMTc1LjUtNDkuMTIgMjA4LjE3Yy03LjYyIDMyLjY0LTUuNTggNzYuNi0yLjQzIDEwOS4zNEMyMDguNTUgODMwLjUyIDEwMi45NiA2ODMuNzggMTAyLjk2IDUxMmMwLTIyNi4xNCAxODIuOS00MDkuMDQgNDA5LjA0LTQwOS4wNCIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(PinterestOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PinterestOutlined';
}
var _default = exports.default = RefIcon;