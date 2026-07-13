"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AudioTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AudioTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AudioTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AudioTwoTone.default
}));

/**![audio](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA1NTJjNTQuMyAwIDk4LTQzLjIgOTgtOTZWMjMyYzAtNTIuOC00My43LTk2LTk4LTk2cy05OCA0My4yLTk4IDk2djIyNGMwIDUyLjggNDMuNyA5NiA5OCA5NnoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTg0MiA0NTRjMC00LjQtMy42LTgtOC04aC02MGMtNC40IDAtOCAzLjYtOCA4IDAgMTQwLjMtMTEzLjcgMjU0LTI1NCAyNTRTMjU4IDU5NC4zIDI1OCA0NTRjMC00LjQtMy42LTgtOC04aC02MGMtNC40IDAtOCAzLjYtOCA4IDAgMTY4LjcgMTI2LjYgMzA3LjkgMjkwIDMyNy42Vjg4NEgzMjYuN2MtMTMuNyAwLTI0LjcgMTQuMy0yNC43IDMydjM2YzAgNC40IDIuOCA4IDYuMiA4aDQwNy42YzMuNCAwIDYuMi0zLjYgNi4yLTh2LTM2YzAtMTcuNy0xMS0zMi0yNC43LTMySDU0OFY3ODIuMWMxNjUuMy0xOCAyOTQtMTU4IDI5NC0zMjguMXoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTUxMiA2MjRjOTMuOSAwIDE3MC03NS4yIDE3MC0xNjhWMjMyYzAtOTIuOC03Ni4xLTE2OC0xNzAtMTY4cy0xNzAgNzUuMi0xNzAgMTY4djIyNGMwIDkyLjggNzYuMSAxNjggMTcwIDE2OHptLTk4LTM5MmMwLTUyLjggNDMuNy05NiA5OC05NnM5OCA0My4yIDk4IDk2djIyNGMwIDUyLjgtNDMuNyA5Ni05OCA5NnMtOTgtNDMuMi05OC05NlYyMzJ6IiBmaWxsPSIjMTY3N2ZmIiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(AudioTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AudioTwoTone';
}
var _default = exports.default = RefIcon;