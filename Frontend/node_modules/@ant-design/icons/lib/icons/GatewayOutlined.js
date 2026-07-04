"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _GatewayOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/GatewayOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const GatewayOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _GatewayOutlined.default
}));

/**![gateway](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAzOTJjOC44IDAgMTYtNy4yIDE2LTE2VjE5MmMwLTguOC03LjItMTYtMTYtMTZINzQ0Yy04LjggMC0xNiA3LjItMTYgMTZ2NTZIMjk2di01NmMwLTguOC03LjItMTYtMTYtMTZIOTZjLTguOCAwLTE2IDcuMi0xNiAxNnYxODRjMCA4LjggNy4yIDE2IDE2IDE2aDU2djI0MEg5NmMtOC44IDAtMTYgNy4yLTE2IDE2djE4NGMwIDguOCA3LjIgMTYgMTYgMTZoMTg0YzguOCAwIDE2LTcuMiAxNi0xNnYtNTZoNDMydjU2YzAgOC44IDcuMiAxNiAxNiAxNmgxODRjOC44IDAgMTYtNy4yIDE2LTE2VjY0OGMwLTguOC03LjItMTYtMTYtMTZoLTU2VjM5Mmg1NnpNNzkyIDI0MGg4OHY4OGgtODh2LTg4em0tNjQ4IDg4di04OGg4OHY4OGgtODh6bTg4IDQ1NmgtODh2LTg4aDg4djg4em02NDgtODh2ODhoLTg4di04OGg4OHptLTgwLTY0aC01NmMtOC44IDAtMTYgNy4yLTE2IDE2djU2SDI5NnYtNTZjMC04LjgtNy4yLTE2LTE2LTE2aC01NlYzOTJoNTZjOC44IDAgMTYtNy4yIDE2LTE2di01Nmg0MzJ2NTZjMCA4LjggNy4yIDE2IDE2IDE2aDU2djI0MHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(GatewayOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'GatewayOutlined';
}
var _default = exports.default = RefIcon;