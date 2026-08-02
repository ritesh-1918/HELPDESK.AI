"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GoogleOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GoogleOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GoogleOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GoogleOutlined.default
}));

/**![google](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MSA0NDIuNEg1MTkuN3YxNDguNWgyMDYuNGMtOC45IDQ4LTM1LjkgODguNi03Ni42IDExNS44LTM0LjQgMjMtNzguMyAzNi42LTEyOS45IDM2LjYtOTkuOSAwLTE4NC40LTY3LjUtMjE0LjYtMTU4LjItNy42LTIzLTEyLTQ3LjYtMTItNzIuOXM0LjQtNDkuOSAxMi03Mi45YzMwLjMtOTAuNiAxMTQuOC0xNTguMSAyMTQuNy0xNTguMSA1Ni4zIDAgMTA2LjggMTkuNCAxNDYuNiA1Ny40bDExMC0xMTAuMWMtNjYuNS02Mi0xNTMuMi0xMDAtMjU2LjYtMTAwLTE0OS45IDAtMjc5LjYgODYtMzQyLjcgMjExLjQtMjYgNTEuOC00MC44IDExMC40LTQwLjggMTcyLjRTMTUxIDYzMi44IDE3NyA2ODQuNkMyNDAuMSA4MTAgMzY5LjggODk2IDUxOS43IDg5NmMxMDMuNiAwIDE5MC40LTM0LjQgMjUzLjgtOTMgNzIuNS02Ni44IDExNC40LTE2NS4yIDExNC40LTI4Mi4xIDAtMjcuMi0yLjQtNTMuMy02LjktNzguNXoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(GoogleOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GoogleOutlined';
}
var _default = exports.default = RefIcon;