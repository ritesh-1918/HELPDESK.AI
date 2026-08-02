"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SketchOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SketchOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SketchOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SketchOutlined.default
}));

/**![sketch](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNS42IDQwNS4xbC0yMDMtMjUzLjdhNi41IDYuNSAwIDAwLTUtMi40SDMwNi40Yy0xLjkgMC0zLjguOS01IDIuNGwtMjAzIDI1My43YTYuNSA2LjUgMCAwMC4yIDguM2w0MDguNiA0NTkuNWMxLjIgMS40IDMgMi4xIDQuOCAyLjEgMS44IDAgMy41LS44IDQuOC0yLjFsNDA4LjYtNDU5LjVhNi41IDYuNSAwIDAwLjItOC4zek02NDUuMiAyMDYuNGwzNC40IDEzMy45LTEzMi41LTEzMy45aDk4LjF6bTguMiAxNzguNUgzNzAuNkw1MTIgMjQybDE0MS40IDE0Mi45ek0zNzguOCAyMDYuNGg5OC4xTDM0NC4zIDM0MC4zbDM0LjUtMTMzLjl6bS01My40IDdsLTQ0LjEgMTcxLjVoLTkzLjFsMTM3LjItMTcxLjV6TTE5NC42IDQzNC45SDI4OWwxMjUuOCAyNDcuNy0yMjAuMi0yNDcuN3pNNTEyIDc2My40TDM0NS4xIDQzNC45aDMzMy43TDUxMiA3NjMuNHptOTcuMS04MC44TDczNSA0MzQuOWg5NC40TDYwOS4xIDY4Mi42em0xMzMuNi0yOTcuN2wtNDQuMS0xNzEuNSAxMzcuMiAxNzEuNWgtOTMuMXoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(SketchOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SketchOutlined';
}
var _default = exports.default = RefIcon;