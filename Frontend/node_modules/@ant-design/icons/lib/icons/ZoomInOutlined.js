"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ZoomInOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ZoomInOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ZoomInOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ZoomInOutlined.default
}));

/**![zoom-in](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYzNyA0NDNINTE5VjMwOWMwLTQuNC0zLjYtOC04LThoLTYwYy00LjQgMC04IDMuNi04IDh2MTM0SDMyNWMtNC40IDAtOCAzLjYtOCA4djYwYzAgNC40IDMuNiA4IDggOGgxMTh2MTM0YzAgNC40IDMuNiA4IDggOGg2MGM0LjQgMCA4LTMuNiA4LThWNTE5aDExOGM0LjQgMCA4LTMuNiA4LTh2LTYwYzAtNC40LTMuNi04LTgtOHptMjg0IDQyNEw3NzUgNzIxYzEyMi4xLTE0OC45IDExMy42LTM2OS41LTI2LTUwOS0xNDgtMTQ4LjEtMzg4LjQtMTQ4LjEtNTM3IDAtMTQ4LjEgMTQ4LjYtMTQ4LjEgMzg5IDAgNTM3IDEzOS41IDEzOS42IDM2MC4xIDE0OC4xIDUwOSAyNmwxNDYgMTQ2YzMuMiAyLjggOC4zIDIuOCAxMSAwbDQzLTQzYzIuOC0yLjcgMi44LTcuOCAwLTExek02OTYgNjk2Yy0xMTguOCAxMTguNy0zMTEuMiAxMTguNy00MzAgMC0xMTguNy0xMTguOC0xMTguNy0zMTEuMiAwLTQzMCAxMTguOC0xMTguNyAzMTEuMi0xMTguNyA0MzAgMCAxMTguNyAxMTguOCAxMTguNyAzMTEuMiAwIDQzMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ZoomInOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ZoomInOutlined';
}
var _default = exports.default = RefIcon;