"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CiCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CiCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CiCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CiCircleFilled.default
}));

/**![ci-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0tNjMuNiA2NTZjLTEwMyAwLTE2Mi40LTY4LjYtMTYyLjQtMTgyLjZ2LTQ5QzI4NiAzNzMuNSAzNDUuNCAzMDQgNDQ4LjMgMzA0Yzg4LjMgMCAxNTIuMyA1Ni45IDE1Mi4zIDEzOC4xIDAgMi40LTIgNC40LTQuNCA0LjRoLTUyLjZjLTQuMiAwLTcuNi0zLjItOC03LjQtNC00Ni4xLTM3LjYtNzcuNi04Ny03Ny42LTYxLjEgMC05NS42IDQ1LjQtOTUuNiAxMjYuOXY0OS4zYzAgODAuMyAzNC41IDEyNS4xIDk1LjYgMTI1LjEgNDkuMyAwIDgyLjgtMjkuNSA4Ny03Mi40LjQtNC4xIDMuOC03LjMgOC03LjNoNTIuN2MyLjQgMCA0LjQgMiA0LjQgNC40IDAgNzcuNC02NC4zIDEzMi41LTE1Mi4zIDEzMi41ek03MzggNzA0LjFjMCA0LjQtMy42IDgtOCA4aC01MC40Yy00LjQgMC04LTMuNi04LThWMzE5LjljMC00LjQgMy42LTggOC04SDczMGM0LjQgMCA4IDMuNiA4IDh2Mzg0LjJ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CiCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CiCircleFilled';
}
var _default = exports.default = RefIcon;