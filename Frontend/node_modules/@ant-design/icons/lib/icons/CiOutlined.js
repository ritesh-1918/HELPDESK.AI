"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CiOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CiOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CiOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CiOutlined.default
}));

/**![ci](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnptMjE4LTU3Mi4xaC01MC40Yy00LjQgMC04IDMuNi04IDh2Mzg0LjJjMCA0LjQgMy42IDggOCA4SDczMGM0LjQgMCA4LTMuNiA4LThWMzE5LjljMC00LjQtMy42LTgtOC04em0tMjgxLjQgNDkuNmM0OS41IDAgODMuMSAzMS41IDg3IDc3LjYuNCA0LjIgMy44IDcuNCA4IDcuNGg1Mi42YzIuNCAwIDQuNC0yIDQuNC00LjQgMC04MS4yLTY0LTEzOC4xLTE1Mi4zLTEzOC4xQzM0NS40IDMwNCAyODYgMzczLjUgMjg2IDQ4OC40djQ5YzAgMTE0IDU5LjQgMTgyLjYgMTYyLjMgMTgyLjYgODggMCAxNTIuMy01NS4xIDE1Mi4zLTEzMi41IDAtMi40LTItNC40LTQuNC00LjRoLTUyLjdjLTQuMiAwLTcuNiAzLjItOCA3LjMtNC4yIDQzLTM3LjcgNzIuNC04NyA3Mi40LTYxLjEgMC05NS42LTQ0LjktOTUuNi0xMjUuMnYtNDkuM2MuMS04MS40IDM0LjYtMTI2LjggOTUuNy0xMjYuOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(CiOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CiOutlined';
}
var _default = exports.default = RefIcon;