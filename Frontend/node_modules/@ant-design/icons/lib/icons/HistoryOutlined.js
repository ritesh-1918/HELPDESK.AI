"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _HistoryOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/HistoryOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const HistoryOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _HistoryOutlined.default
}));

/**![history](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUzNi4xIDI3M0g0ODhjLTQuNCAwLTggMy42LTggOHYyNzUuM2MwIDIuNiAxLjIgNSAzLjMgNi41bDE2NS4zIDEyMC43YzMuNiAyLjYgOC42IDEuOSAxMS4yLTEuN2wyOC42LTM5YzIuNy0zLjcgMS45LTguNy0xLjctMTEuMkw1NDQuMSA1MjguNVYyODFjMC00LjQtMy42LTgtOC04em0yMTkuOCA3NS4ybDE1Ni44IDM4LjNjNSAxLjIgOS45LTIuNiA5LjktNy43bC44LTE2MS41YzAtNi43LTcuNy0xMC41LTEyLjktNi4zTDc1Mi45IDMzNC4xYTggOCAwIDAwMyAxNC4xem0xNjcuNyAzMDEuMWwtNTYuNy0xOS41YTggOCAwIDAwLTEwLjEgNC44Yy0xLjkgNS4xLTMuOSAxMC4xLTYgMTUuMS0xNy44IDQyLjEtNDMuMyA4MC03NS45IDExMi41YTM1MyAzNTMgMCAwMS0xMTIuNSA3NS45IDM1Mi4xOCAzNTIuMTggMCAwMS0xMzcuNyAyNy44Yy00Ny44IDAtOTQuMS05LjMtMTM3LjctMjcuOGEzNTMgMzUzIDAgMDEtMTEyLjUtNzUuOWMtMzIuNS0zMi41LTU4LTcwLjQtNzUuOS0xMTIuNUEzNTMuNDQgMzUzLjQ0IDAgMDExNzEgNTEyYzAtNDcuOCA5LjMtOTQuMiAyNy44LTEzNy44IDE3LjgtNDIuMSA0My4zLTgwIDc1LjktMTEyLjVhMzUzIDM1MyAwIDAxMTEyLjUtNzUuOUM0MzAuNiAxNjcuMyA0NzcgMTU4IDUyNC44IDE1OHM5NC4xIDkuMyAxMzcuNyAyNy44QTM1MyAzNTMgMCAwMTc3NSAyNjEuN2MxMC4yIDEwLjMgMTkuOCAyMSAyOC42IDMyLjNsNTkuOC00Ni44Qzc4NC43IDE0Ni42IDY2Mi4yIDgxLjkgNTI0LjYgODIgMjg1IDgyLjEgOTIuNiAyNzYuNyA5NSA1MTYuNCA5Ny40IDc1MS45IDI4OC45IDk0MiA1MjQuOCA5NDJjMTg1LjUgMCAzNDMuNS0xMTcuNiA0MDMuNy0yODIuMyAxLjUtNC4yLS43LTguOS00LjktMTAuNHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(HistoryOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'HistoryOutlined';
}
var _default = exports.default = RefIcon;