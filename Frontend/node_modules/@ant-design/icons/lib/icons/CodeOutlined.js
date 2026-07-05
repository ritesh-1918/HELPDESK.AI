"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CodeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CodeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CodeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CodeOutlined.default
}));

/**![code](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxNiA2NzNjMCA0LjQgMy40IDggNy41IDhoMTg1YzQuMSAwIDcuNS0zLjYgNy41LTh2LTQ4YzAtNC40LTMuNC04LTcuNS04aC0xODVjLTQuMSAwLTcuNSAzLjYtNy41IDh2NDh6bS0xOTQuOSA2LjFsMTkyLTE2MWMzLjgtMy4yIDMuOC05LjEgMC0xMi4zbC0xOTItMTYwLjlBNy45NSA3Ljk1IDAgMDAzMDggMzUxdjYyLjdjMCAyLjQgMSA0LjYgMi45IDYuMUw0MjAuNyA1MTJsLTEwOS44IDkyLjJhOC4xIDguMSAwIDAwLTIuOSA2LjFWNjczYzAgNi44IDcuOSAxMC41IDEzLjEgNi4xek04ODAgMTEySDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NzM2YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDczNmMxNy43IDAgMzItMTQuMyAzMi0zMlYxNDRjMC0xNy43LTE0LjMtMzItMzItMzJ6bS00MCA3MjhIMTg0VjE4NGg2NTZ2NjU2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CodeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CodeOutlined';
}
var _default = exports.default = RefIcon;