"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileZipOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileZipOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileZipOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileZipOutlined.default
}));

/**![file-zip](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5NiAzOTJoNjR2NjRoLTY0em0wIDE5MHYxNjBoMTI4VjU4MmgtNjR2LTYyaC02NHY2MnptODAgNDh2NjRoLTMydi02NGgzMnptLTE2LTMwMmg2NHY2NGgtNjR6bS02NC02NGg2NHY2NGgtNjR6bTY0IDE5Mmg2NHY2NGgtNjR6bTAtMjU2aDY0djY0aC02NHptNDk0LjYgODguNkw2MzkuNCA3My40Yy02LTYtMTQuMS05LjQtMjIuNi05LjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjMxMS4zYzAtOC41LTMuNC0xNi43LTkuNC0yMi43ek03OTAuMiAzMjZINjAyVjEzNy44TDc5MC4yIDMyNnptMS44IDU2MkgyMzJWMTM2aDY0djY0aDY0di02NGgxNzR2MjE2YTQyIDQyIDAgMDA0MiA0MmgyMTZ2NDk0eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileZipOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileZipOutlined';
}
var _default = exports.default = RefIcon;