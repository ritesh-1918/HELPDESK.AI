"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MergeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MergeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MergeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MergeOutlined.default
}));

/**![merge](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQ4IDc1Mmg3MlYyNjRoLTcyeiIgLz48cGF0aCBkPSJNNzQwIDg2M2M2MS44NiAwIDExMi01MC4xNCAxMTItMTEyIDAtNDguMzMtMzAuNi04OS41LTczLjUtMTA1LjJsLS4wMS0xMTMuMDRhNTAuNzMgNTAuNzMgMCAwMC0zNC45NS00OC4ybC00MzQuOS0xNDIuNDEtMjIuNCA2OC40MiA0MjAuMjUgMTM3LjYxLjAxIDk1LjkyQzY2MSA2NTguMzQgNjI4IDcwMC44IDYyOCA3NTFjMCA2MS44NiA1MC4xNCAxMTIgMTEyIDExMm0tNDU2IDYxYzYxLjg2IDAgMTEyLTUwLjE0IDExMi0xMTJzLTUwLjE0LTExMi0xMTItMTEyLTExMiA1MC4xNC0xMTIgMTEyIDUwLjE0IDExMiAxMTIgMTEybTQ1Ni0xMjVhNDggNDggMCAxMTAtOTYgNDggNDggMCAwMTAgOTZtLTQ1NiA2MWE0OCA0OCAwIDExMC05NiA0OCA0OCAwIDAxMCA5Nm0wLTUzNmM2MS44NiAwIDExMi01MC4xNCAxMTItMTEycy01MC4xNC0xMTItMTEyLTExMi0xMTIgNTAuMTQtMTEyIDExMiA1MC4xNCAxMTIgMTEyIDExMm0wLTY0YTQ4IDQ4IDAgMTEwLTk2IDQ4IDQ4IDAgMDEwIDk2IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MergeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MergeOutlined';
}
var _default = exports.default = RefIcon;