"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MergeFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MergeFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MergeFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MergeFilled.default
}));

/**![merge](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjg0IDkyNGM2MS44NiAwIDExMi01MC4xNCAxMTItMTEyIDAtNDkuMjYtMzEuOC05MS4xLTc2LTEwNi4wOVY0MjEuNjNsMzg2LjQ5IDEyNi41NS4wMSA5NS45MkM2NjEgNjU4LjM0IDYyOCA3MDAuOCA2MjggNzUxYzAgNjEuODYgNTAuMTQgMTEyIDExMiAxMTJzMTEyLTUwLjE0IDExMi0xMTJjMC00OC4zMy0zMC42LTg5LjUtNzMuNS0xMDUuMmwtLjAxLTExMy4wNGE1MC43MyA1MC43MyAwIDAwLTM0Ljk1LTQ4LjJMMzIwIDM0NS44NVYzMTguMWM0My42NC0xNC44IDc1LjItNTUuNzggNzUuOTktMTA0LjI0TDM5NiAyMTJjMC02MS44Ni01MC4xNC0xMTItMTEyLTExMnMtMTEyIDUwLjE0LTExMiAxMTJjMCA0OS4yNiAzMS44IDkxLjEgNzYgMTA2LjA5VjcwNS45Yy00NC4yIDE1LTc2IDU2LjgzLTc2IDEwNi4wOSAwIDYxLjg2IDUwLjE0IDExMiAxMTIgMTEyIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MergeFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MergeFilled';
}
var _default = exports.default = RefIcon;