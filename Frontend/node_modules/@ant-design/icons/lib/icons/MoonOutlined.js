"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MoonOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MoonOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MoonOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MoonOutlined.default
}));

/**![moon](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDg5LjUgMTExLjY2YzMwLjY1LTEuOCA0NS45OCAzNi40NCAyMi41OCA1Ni4zM0EyNDMuMzUgMjQzLjM1IDAgMDA0MjYgMzU0YzAgMTM0Ljc2IDEwOS4yNCAyNDQgMjQ0IDI0NCA3Mi41OCAwIDEzOS45LTMxLjgzIDE4Ni4wMS04Ni4wOCAxOS44Ny0yMy4zOCA1OC4wNy04LjEgNTYuMzQgMjIuNTNDOTAwLjQgNzQ1LjgyIDcyNS4xNSA5MTIgNTEyLjUgOTEyIDI5MS4zMSA5MTIgMTEyIDczMi42OSAxMTIgNTExLjVjMC0yMTEuMzkgMTY0LjI5LTM4Ni4wMiAzNzQuMi0zOTkuNjVsLjItLjAxem0tODEuMTUgNzkuNzVsLTQuMTEgMS4zNkMyNzEuMSAyMzcuOTQgMTc2IDM2NC4wOSAxNzYgNTExLjUgMTc2IDY5Ny4zNCAzMjYuNjYgODQ4IDUxMi41IDg0OGMxNDguMjggMCAyNzQuOTQtOTYuMiAzMTkuNDUtMjMwLjQxbC42My0xLjkzLS4xMS4wN2EzMDcuMDYgMzA3LjA2IDAgMDEtMTU5LjczIDQ2LjI2TDY3MCA2NjJjLTE3MC4xIDAtMzA4LTEzNy45LTMwOC0zMDggMC01OC42IDE2LjQ4LTExNC41NCA0Ni4yNy0xNjIuNDd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(MoonOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MoonOutlined';
}
var _default = exports.default = RefIcon;