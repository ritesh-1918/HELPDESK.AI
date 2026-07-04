"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _WomanOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/WomanOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const WomanOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _WomanOutlined.default
}));

/**![woman](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcxMi44IDU0OC44YzUzLjYtNTMuNiA4My4yLTEyNSA4My4yLTIwMC44IDAtNzUuOS0yOS41LTE0Ny4yLTgzLjItMjAwLjhDNjU5LjIgOTMuNiA1ODcuOCA2NCA1MTIgNjRzLTE0Ny4yIDI5LjUtMjAwLjggODMuMkMyNTcuNiAyMDAuOSAyMjggMjcyLjEgMjI4IDM0OGMwIDYzLjggMjAuOSAxMjQuNCA1OS40IDE3My45IDcuMyA5LjQgMTUuMiAxOC4zIDIzLjcgMjYuOSA4LjUgOC41IDE3LjUgMTYuNCAyNi44IDIzLjcgMzkuNiAzMC44IDg2LjMgNTAuNCAxMzYuMSA1N1Y3MzZIMzYwYy00LjQgMC04IDMuNi04IDh2NjBjMCA0LjQgMy42IDggOCA4aDExNHYxNDBjMCA0LjQgMy42IDggOCA4aDYwYzQuNCAwIDgtMy42IDgtOFY4MTJoMTE0YzQuNCAwIDgtMy42IDgtOHYtNjBjMC00LjQtMy42LTgtOC04SDU1MFY2MjkuNWM2MS41LTguMiAxMTguMi0zNi4xIDE2Mi44LTgwLjd6TTUxMiA1NTZjLTU1LjYgMC0xMDcuNy0yMS42LTE0Ny4xLTYwLjlDMzI1LjYgNDU1LjggMzA0IDQwMy42IDMwNCAzNDhzMjEuNi0xMDcuNyA2MC45LTE0Ny4xQzQwNC4yIDE2MS41IDQ1Ni40IDE0MCA1MTIgMTQwczEwNy43IDIxLjYgMTQ3LjEgNjAuOUM2OTguNCAyNDAuMiA3MjAgMjkyLjQgNzIwIDM0OHMtMjEuNiAxMDcuNy02MC45IDE0Ny4xQzYxOS43IDUzNC40IDU2Ny42IDU1NiA1MTIgNTU2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(WomanOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'WomanOutlined';
}
var _default = exports.default = RefIcon;