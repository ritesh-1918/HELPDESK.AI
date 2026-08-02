"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DiffOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DiffOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DiffOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DiffOutlined.default
}));

/**![diff](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQ3NiAzOTkuMWMwLTMuOS0zLjEtNy4xLTctNy4xaC00MmMtMy44IDAtNyAzLjItNyA3LjFWNDg0aC04NC41Yy00LjEgMC03LjUgMy4xLTcuNSA3djQyYzAgMy44IDMuNCA3IDcuNSA3SDQyMHY4NC45YzAgMy45IDMuMiA3LjEgNyA3LjFoNDJjMy45IDAgNy0zLjIgNy03LjFWNTQwaDg0LjVjNC4xIDAgNy41LTMuMiA3LjUtN3YtNDJjMC0zLjktMy40LTctNy41LTdINDc2di04NC45ek01NjAuNSA3MDRoLTIyNWMtNC4xIDAtNy41IDMuMi03LjUgN3Y0MmMwIDMuOCAzLjQgNyA3LjUgN2gyMjVjNC4xIDAgNy41LTMuMiA3LjUtN3YtNDJjMC0zLjgtMy40LTctNy41LTd6bS03LjEtNTAyLjZjLTYtNi0xNC4xLTkuNC0yMi42LTkuNEgxOTJjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjcwNGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg1MTJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMzk3LjNjMC04LjUtMy40LTE2LjYtOS40LTIyLjZMNTUzLjQgMjAxLjR6TTY2NCA4ODhIMjMyVjI2NGgyODIuMkw2NjQgNDEzLjhWODg4em0xOTAuMi01ODEuNEw2MTEuMyA3Mi45Yy02LTUuNy0xMy45LTguOS0yMi4yLTguOUgyOTZjLTQuNCAwLTggMy42LTggOHY1NmMwIDQuNCAzLjYgOCA4IDhoMjc3bDIxOSAyMTAuNlY4MjRjMCA0LjQgMy42IDggOCA4aDU2YzQuNCAwIDgtMy42IDgtOFYzMjkuNmMwLTguNy0zLjUtMTctOS44LTIzeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DiffOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DiffOutlined';
}
var _default = exports.default = RefIcon;