"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AudioFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AudioFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AudioFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AudioFilled.default
}));

/**![audio](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2MjRjOTMuOSAwIDE3MC03NS4yIDE3MC0xNjhWMjMyYzAtOTIuOC03Ni4xLTE2OC0xNzAtMTY4cy0xNzAgNzUuMi0xNzAgMTY4djIyNGMwIDkyLjggNzYuMSAxNjggMTcwIDE2OHptMzMwLTE3MGMwLTQuNC0zLjYtOC04LThoLTYwYy00LjQgMC04IDMuNi04IDggMCAxNDAuMy0xMTMuNyAyNTQtMjU0IDI1NFMyNTggNTk0LjMgMjU4IDQ1NGMwLTQuNC0zLjYtOC04LThoLTYwYy00LjQgMC04IDMuNi04IDggMCAxNjguNyAxMjYuNiAzMDcuOSAyOTAgMzI3LjZWODg0SDMyNi43Yy0xMy43IDAtMjQuNyAxNC4zLTI0LjcgMzJ2MzZjMCA0LjQgMi44IDggNi4yIDhoNDA3LjZjMy40IDAgNi4yLTMuNiA2LjItOHYtMzZjMC0xNy43LTExLTMyLTI0LjctMzJINTQ4Vjc4Mi4xYzE2NS4zLTE4IDI5NC0xNTggMjk0LTMyOC4xeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(AudioFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AudioFilled';
}
var _default = exports.default = RefIcon;