"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SkinTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SkinTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SkinTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SkinTwoTone.default
}));

/**![skin](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiAzMThjLTc5LjIgMC0xNDguNS00OC44LTE3Ni43LTEyMEgxODJ2MTk2aDExOXY0MzJoNDIyVjM5NGgxMTlWMTk4SDY4OC43Yy0yOC4yIDcxLjItOTcuNSAxMjAtMTc2LjcgMTIweiIgZmlsbD0iI2U2ZjRmZiIgLz48cGF0aCBkPSJNODcwIDEyNkg2NjMuOGMtMTcuNCAwLTMyLjkgMTEuOS0zNyAyOS4zQzYxNC4zIDIwOC4xIDU2NyAyNDYgNTEyIDI0NnMtMTAyLjMtMzcuOS0xMTQuOC05MC43YTM3LjkzIDM3LjkzIDAgMDAtMzctMjkuM0gxNTRhNDQgNDQgMCAwMC00NCA0NHYyNTJhNDQgNDQgMCAwMDQ0IDQ0aDc1djM4OGE0NCA0NCAwIDAwNDQgNDRoNDc4YTQ0IDQ0IDAgMDA0NC00NFY0NjZoNzVhNDQgNDQgMCAwMDQ0LTQ0VjE3MGE0NCA0NCAwIDAwLTQ0LTQ0em0tMjggMjY4SDcyM3Y0MzJIMzAxVjM5NEgxODJWMTk4aDE1My4zYzI4LjIgNzEuMiA5Ny41IDEyMCAxNzYuNyAxMjBzMTQ4LjUtNDguOCAxNzYuNy0xMjBIODQydjE5NnoiIGZpbGw9IiMxNjc3ZmYiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(SkinTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SkinTwoTone';
}
var _default = exports.default = RefIcon;