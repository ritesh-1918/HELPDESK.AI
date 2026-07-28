"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ExperimentOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ExperimentOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ExperimentOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ExperimentOutlined.default
}));

/**![experiment](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA0NzJhNDAgNDAgMCAxMDgwIDAgNDAgNDAgMCAxMC04MCAwem0zNjcgMzUyLjlMNjk2LjMgMzUyVjE3OEg3Njh2LTY4SDI1NnY2OGg3MS43djE3NEwxNDUgODI0LjljLTIuOCA3LjQtNC4zIDE1LjItNC4zIDIzLjEgMCAzNS4zIDI4LjcgNjQgNjQgNjRoNjE0LjZjNy45IDAgMTUuNy0xLjUgMjMuMS00LjMgMzMtMTIuNyA0OS40LTQ5LjggMzYuNi04Mi44ek0zOTUuNyAzNjQuN1YxODBoMjMyLjZ2MTg0LjdMNzE5LjIgNjAwYy0yMC43LTUuMy00Mi4xLTgtNjMuOS04LTYxLjIgMC0xMTkuMiAyMS41LTE2NS4zIDYwYTE4OC43OCAxODguNzggMCAwMS0xMjEuMyA0My45Yy0zMi43IDAtNjQuMS04LjMtOTEuOC0yMy43bDExOC44LTMwNy41ek0yMTAuNSA4NDRsNDEuNy0xMDcuOGMzNS43IDE4LjEgNzUuNCAyNy44IDExNi42IDI3LjggNjEuMiAwIDExOS4yLTIxLjUgMTY1LjMtNjAgMzMuOS0yOC4yIDc2LjMtNDMuOSAxMjEuMy00My45IDM1IDAgNjguNCA5LjUgOTcuNiAyNy4xTDgxMy41IDg0NGgtNjAzeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(ExperimentOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ExperimentOutlined';
}
var _default = exports.default = RefIcon;