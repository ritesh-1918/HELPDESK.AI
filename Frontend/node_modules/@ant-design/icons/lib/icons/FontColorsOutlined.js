"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FontColorsOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FontColorsOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FontColorsOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FontColorsOutlined.default
}));

/**![font-colors](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkwNCA4MTZIMTIwYy00LjQgMC04IDMuNi04IDh2ODBjMCA0LjQgMy42IDggOCA4aDc4NGM0LjQgMCA4LTMuNiA4LTh2LTgwYzAtNC40LTMuNi04LTgtOHptLTY1MC4zLTgwaDg1YzQuMiAwIDgtMi43IDkuMy02LjhsNTMuNy0xNjZoMjE5LjJsNTMuMiAxNjZjMS4zIDQgNSA2LjggOS4zIDYuOGg4OS4xYzEuMSAwIDIuMi0uMiAzLjItLjVhOS43IDkuNyAwIDAwNi0xMi40TDU3My42IDExOC42YTkuOSA5LjkgMCAwMC05LjItNi42SDQ2Mi4xYy00LjIgMC03LjkgMi42LTkuMiA2LjZMMjQ0LjUgNzIzLjFjLS40IDEtLjUgMi4xLS41IDMuMi0uMSA1LjMgNC4zIDkuNyA5LjcgOS43em0yNTUuOS01MTYuMWg0LjFsODMuOCAyNjMuOEg0MjQuOWw4NC43LTI2My44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FontColorsOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FontColorsOutlined';
}
var _default = exports.default = RefIcon;