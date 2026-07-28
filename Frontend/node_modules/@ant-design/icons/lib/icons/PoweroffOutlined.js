"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PoweroffOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PoweroffOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PoweroffOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PoweroffOutlined.default
}));

/**![poweroff](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcwNS42IDEyNC45YTggOCAwIDAwLTExLjYgNy4ydjY0LjJjMCA1LjUgMi45IDEwLjYgNy41IDEzLjZhMzUyLjIgMzUyLjIgMCAwMTYyLjIgNDkuOGMzMi43IDMyLjggNTguNCA3MC45IDc2LjMgMTEzLjNhMzU1IDM1NSAwIDAxMjcuOSAxMzguN2MwIDQ4LjEtOS40IDk0LjgtMjcuOSAxMzguN2EzNTUuOTIgMzU1LjkyIDAgMDEtNzYuMyAxMTMuMyAzNTMuMDYgMzUzLjA2IDAgMDEtMTEzLjIgNzYuNGMtNDMuOCAxOC42LTkwLjUgMjgtMTM4LjUgMjhzLTk0LjctOS40LTEzOC41LTI4YTM1My4wNiAzNTMuMDYgMCAwMS0xMTMuMi03Ni40QTM1NS45MiAzNTUuOTIgMCAwMTE4NCA2NTAuNGEzNTUgMzU1IDAgMDEtMjcuOS0xMzguN2MwLTQ4LjEgOS40LTk0LjggMjcuOS0xMzguNyAxNy45LTQyLjQgNDMuNi04MC41IDc2LjMtMTEzLjMgMTktMTkgMzkuOC0zNS42IDYyLjItNDkuOCA0LjctMi45IDcuNS04LjEgNy41LTEzLjZWMTMyYzAtNi02LjMtOS44LTExLjYtNy4yQzE3OC41IDE5NS4yIDgyIDMzOS4zIDgwIDUwNi4zIDc3LjIgNzQ1LjEgMjcyLjUgOTQzLjUgNTExLjIgOTQ0YzIzOSAuNSA0MzIuOC0xOTMuMyA0MzIuOC00MzIuNCAwLTE2OS4yLTk3LTMxNS43LTIzOC40LTM4Ni43ek00ODAgNTYwaDY0YzQuNCAwIDgtMy42IDgtOFY4OGMwLTQuNC0zLjYtOC04LThoLTY0Yy00LjQgMC04IDMuNi04IDh2NDY0YzAgNC40IDMuNiA4IDggOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PoweroffOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PoweroffOutlined';
}
var _default = exports.default = RefIcon;