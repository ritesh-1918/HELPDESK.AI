"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SisternodeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SisternodeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SisternodeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SisternodeOutlined.default
}));

/**![sisternode](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik02NzIgNDMyYy0xMjAuMyAwLTIxOS45IDg4LjUtMjM3LjMgMjA0SDMyMGMtMTUuNSAwLTI4LTEyLjUtMjgtMjhWMjQ0aDI5MWMxNC4yIDM1LjIgNDguNyA2MCA4OSA2MCA1MyAwIDk2LTQzIDk2LTk2cy00My05Ni05Ni05NmMtNDAuMyAwLTc0LjggMjQuOC04OSA2MEgxMTJ2NzJoMTA4djM2NGMwIDU1LjIgNDQuOCAxMDAgMTAwIDEwMGgxMTQuN2MxNy40IDExNS41IDExNyAyMDQgMjM3LjMgMjA0IDEzMi41IDAgMjQwLTEwNy41IDI0MC0yNDBTODA0LjUgNDMyIDY3MiA0MzJ6bTEyOCAyNjZjMCA0LjQtMy42IDgtOCA4aC04NnY4NmMwIDQuNC0zLjYgOC04IDhoLTUyYy00LjQgMC04LTMuNi04LTh2LTg2aC04NmMtNC40IDAtOC0zLjYtOC04di01MmMwLTQuNCAzLjYtOCA4LThoODZ2LTg2YzAtNC40IDMuNi04IDgtOGg1MmM0LjQgMCA4IDMuNiA4IDh2ODZoODZjNC40IDAgOCAzLjYgOCA4djUyeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SisternodeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SisternodeOutlined';
}
var _default = exports.default = RefIcon;