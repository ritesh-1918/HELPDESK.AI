"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileUnknownOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileUnknownOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileUnknownOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileUnknownOutlined.default
}));

/**![file-unknown](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDI4OC43TDYzOS40IDczLjRjLTYtNi0xNC4yLTkuNC0yMi43LTkuNEgxOTJjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjgzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2NDBjMTcuNyAwIDMyLTE0LjMgMzItMzJWMzExLjNjMC04LjUtMy40LTE2LjYtOS40LTIyLjZ6TTc5MC4yIDMyNkg2MDJWMTM3LjhMNzkwLjIgMzI2em0xLjggNTYySDIzMlYxMzZoMzAydjIxNmE0MiA0MiAwIDAwNDIgNDJoMjE2djQ5NHpNNDAyIDU0OWMwIDUuNCA0LjQgOS41IDkuOCA5LjVoMzIuNGM1LjQgMCA5LjgtNC4yIDkuOC05LjQgMC0yOC4yIDI1LjgtNTEuNiA1OC01MS42czU4IDIzLjQgNTggNTEuNWMwIDI1LjMtMjEgNDcuMi00OS4zIDUwLjktMTkuMyAyLjgtMzQuNSAyMC4zLTM0LjcgNDAuMXYzMmMwIDUuNSA0LjUgMTAgMTAgMTBoMzJjNS41IDAgMTAtNC41IDEwLTEwdi0xMi4yYzAtNiA0LTExLjUgOS43LTEzLjMgNDQuNi0xNC40IDc1LTU0IDc0LjMtOTguOS0uOC01NS41LTQ5LjItMTAwLjgtMTA4LjUtMTAxLjYtNjEuNC0uNy0xMTEuNSA0NS42LTExMS41IDEwM3ptNzggMTk1YTMyIDMyIDAgMTA2NCAwIDMyIDMyIDAgMTAtNjQgMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileUnknownOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileUnknownOutlined';
}
var _default = exports.default = RefIcon;