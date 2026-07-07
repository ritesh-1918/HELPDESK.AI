"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _EyeInvisibleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/EyeInvisibleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const EyeInvisibleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _EyeInvisibleFilled.default
}));

/**![eye-invisible](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwOCA2MjRhMTEyIDExMiAwIDAwMTEyLTExMmMwLTMuMjgtLjE1LTYuNTMtLjQzLTkuNzRMNDk4LjI2IDYyMy41N2MzLjIxLjI4IDYuNDUuNDMgOS43NC40M3ptMzcwLjcyLTQ1OC40NEw4MzYgMTIyLjg4YTggOCAwIDAwLTExLjMxIDBMNzE1LjM3IDIzMi4yM1E2MjQuOTEgMTg2IDUxMiAxODZxLTI4OC4zIDAtNDMwLjIgMzAwLjNhNjAuMyA2MC4zIDAgMDAwIDUxLjVxNTYuNyAxMTkuNDMgMTM2LjU1IDE5MS40NUwxMTIuNTYgODM1YTggOCAwIDAwMCAxMS4zMUwxNTUuMjUgODg5YTggOCAwIDAwMTEuMzEgMGw3MTIuMTYtNzEyLjEyYTggOCAwIDAwMC0xMS4zMnpNMzMyIDUxMmExNzYgMTc2IDAgMDEyNTguODgtMTU1LjI4bC00OC42MiA0OC42MmExMTIuMDggMTEyLjA4IDAgMDAtMTQwLjkyIDE0MC45MmwtNDguNjIgNDguNjJBMTc1LjA5IDE3NS4wOSAwIDAxMzMyIDUxMnoiIC8+PHBhdGggZD0iTTk0Mi4yIDQ4Ni4yUTg4OS40IDM3NSA4MTYuNTEgMzA0Ljg1TDY3Mi4zNyA0NDlBMTc2LjA4IDE3Ni4wOCAwIDAxNDQ1IDY3Ni4zN0wzMjIuNzQgNzk4LjYzUTQwNy44MiA4MzggNTEyIDgzOHEyODguMyAwIDQzMC4yLTMwMC4zYTYwLjI5IDYwLjI5IDAgMDAwLTUxLjV6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(EyeInvisibleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'EyeInvisibleFilled';
}
var _default = exports.default = RefIcon;