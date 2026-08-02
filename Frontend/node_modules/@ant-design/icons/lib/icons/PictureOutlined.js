"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PictureOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PictureOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PictureOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PictureOutlined.default
}));

/**![picture](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAxNjBIOTZjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY0MGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTkyYzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjMySDEzNnYtMzkuOWwxMzguNS0xNjQuMyAxNTAuMSAxNzhMNjU4LjEgNDg5IDg4OCA3NjEuNlY3OTJ6bTAtMTI5LjhMNjY0LjIgMzk2LjhjLTMuMi0zLjgtOS0zLjgtMTIuMiAwTDQyNC42IDY2Ni40bC0xNDQtMTcwLjdjLTMuMi0zLjgtOS0zLjgtMTIuMiAwTDEzNiA2NTIuN1YyMzJoNzUydjQzMC4yek0zMDQgNDU2YTg4IDg4IDAgMTAwLTE3NiA4OCA4OCAwIDAwMCAxNzZ6bTAtMTE2YzE1LjUgMCAyOCAxMi41IDI4IDI4cy0xMi41IDI4LTI4IDI4LTI4LTEyLjUtMjgtMjggMTIuNS0yOCAyOC0yOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PictureOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PictureOutlined';
}
var _default = exports.default = RefIcon;