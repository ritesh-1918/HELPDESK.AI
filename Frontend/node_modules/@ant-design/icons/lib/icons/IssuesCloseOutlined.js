"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _IssuesCloseOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/IssuesCloseOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const IssuesCloseOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _IssuesCloseOutlined.default
}));

/**![issues-close](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ2NCA2ODhhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem03Mi0xMTJjNC40IDAgOC0zLjYgOC04VjI5NmMwLTQuNC0zLjYtOC04LThoLTQ4Yy00LjQgMC04IDMuNi04IDh2MjcyYzAgNC40IDMuNiA4IDggOGg0OHptNDAwLTE4OGgtNTkuM2MtMi42IDAtNSAxLjItNi41IDMuM0w3NjMuNyA1MzguMWwtNDkuOS02OC44YTcuOTIgNy45MiAwIDAwLTYuNS0zLjNINjQ4Yy02LjUgMC0xMC4zIDcuNC02LjUgMTIuN2wxMDkuMiAxNTAuN2ExNi4xIDE2LjEgMCAwMDI2IDBsMTY1LjgtMjI4LjdjMy44LTUuMyAwLTEyLjctNi41LTEyLjd6bS00NCAzMDZoLTY0LjJjLTUuNSAwLTEwLjYgMi45LTEzLjYgNy41YTM1Mi4yIDM1Mi4yIDAgMDEtNDkuOCA2Mi4yQTM1NS45MiAzNTUuOTIgMCAwMTY1MS4xIDg0MGEzNTUgMzU1IDAgMDEtMTM4LjcgMjcuOWMtNDguMSAwLTk0LjgtOS40LTEzOC43LTI3LjlhMzU1LjkyIDM1NS45MiAwIDAxLTExMy4zLTc2LjNBMzUzLjA2IDM1My4wNiAwIDAxMTg0IDY1MC41Yy0xOC42LTQzLjgtMjgtOTAuNS0yOC0xMzguNXM5LjQtOTQuNyAyOC0xMzguNWMxNy45LTQyLjQgNDMuNi04MC41IDc2LjQtMTEzLjIgMzIuOC0zMi43IDcwLjktNTguNCAxMTMuMy03Ni4zYTM1NSAzNTUgMCAwMTEzOC43LTI3LjljNDguMSAwIDk0LjggOS40IDEzOC43IDI3LjkgNDIuNCAxNy45IDgwLjUgNDMuNiAxMTMuMyA3Ni4zIDE5IDE5IDM1LjYgMzkuOCA0OS44IDYyLjIgMi45IDQuNyA4LjEgNy41IDEzLjYgNy41SDg5MmM2IDAgOS44LTYuMyA3LjItMTEuNkM4MjguOCAxNzguNSA2ODQuNyA4MiA1MTcuNyA4MCAyNzguOSA3Ny4yIDgwLjUgMjcyLjUgODAgNTExLjIgNzkuNSA3NTAuMSAyNzMuMyA5NDQgNTEyLjQgOTQ0YzE2OS4yIDAgMzE1LjYtOTcgMzg2LjctMjM4LjRBOCA4IDAgMDA4OTIgNjk0eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(IssuesCloseOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'IssuesCloseOutlined';
}
var _default = exports.default = RefIcon;