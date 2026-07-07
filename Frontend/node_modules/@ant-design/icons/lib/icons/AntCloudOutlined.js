"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AntCloudOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AntCloudOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AntCloudOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AntCloudOutlined.default
}));

/**![ant-cloud](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM3OC45IDczOGMtMy4xIDAtNi4xLS41LTguOC0xLjVsNC40IDMwLjdoMjYuM2wtMTUuNS0yOS45Yy0yLjEuNS00LjIuNy02LjQuN3ptNDIxLTI5MS4yYy0xMi42IDAtMjQuOCAxLjUtMzYuNSA0LjItMjEuNC0zOC40LTYyLjMtNjQuMy0xMDkuMy02NC4zLTYuOSAwLTEzLjYuNi0yMC4yIDEuNi0zNS40LTc3LjQtMTEzLjQtMTMxLjEtMjAzLjktMTMxLjEtMTEyLjMgMC0yMDUuMyA4Mi42LTIyMS42IDE5MC40QzEyNy4zIDQ1NS41IDY0IDUyMy44IDY0IDYwN2MwIDg4LjQgNzEuNiAxNjAuMSAxNjAgMTYwLjJoNTBsMTMuMi0yNy42Yy0yNi4yLTguMy00My4zLTI5LTM5LjEtNDguOCA0LjYtMjEuNiAzMi44LTMzLjkgNjMuMS0yNy41IDIyLjkgNC45IDQwLjQgMTkuMSA0NS41IDM1LjFhMjYuMSAyNi4xIDAgMDEyMi4xLTEyLjRoLjJjLS44LTMuMi0xLjItNi41LTEuMi05LjkgMC0yMC4xIDE0LjgtMzYuNyAzNC4xLTM5LjZ2LTI1LjRjMC00LjQgMy42LTggOC04czggMy42IDggOHYyNi4zYzQuNiAxLjIgOC44IDMuMiAxMi42IDUuOGwxOS41LTIxLjRjMy0zLjMgOC0zLjUgMTEuMy0uNSAzLjMgMyAzLjUgOCAuNSAxMS4zbC0yMCAyMi0uMi4yYTQwIDQwIDAgMDEtNDYuOSA1OS4yYy0uNCA1LjYtMi42IDEwLjctNiAxNC44bDIwIDM4LjRIODA0di0uMWM4Ni41LTIuMiAxNTYtNzMgMTU2LTE2MC4xIDAtODguNS03MS43LTE2MC4yLTE2MC4xLTE2MC4yek0zMzguMiA3MzcuMmwtNC4zIDMwaDI0LjRsLTUuOS00MS41Yy0zLjUgNC42LTguMyA4LjUtMTQuMiAxMS41ek03OTcuNSAzMDVhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem0tNjUuNyA2MS4zYTI0IDI0IDAgMTA0OCAwIDI0IDI0IDAgMTAtNDggMHpNMzAzLjQgNzQyLjlsLTExLjYgMjQuM2gyNmwzLjUtMjQuN2MtNS43LjgtMTEuNyAxLTE3LjkuNHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(AntCloudOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AntCloudOutlined';
}
var _default = exports.default = RefIcon;