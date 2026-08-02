"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CoffeeOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CoffeeOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CoffeeOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CoffeeOutlined.default
}));

/**![coffee](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI3NSAyODFjMTkuOSAwIDM2LTE2LjEgMzYtMzZWMzZjMC0xOS45LTE2LjEtMzYtMzYtMzZzLTM2IDE2LjEtMzYgMzZ2MjA5YzAgMTkuOSAxNi4xIDM2IDM2IDM2em02MTMgMTQ0SDc2OGMwLTM5LjgtMzIuMi03Mi03Mi03MkgyMDBjLTM5LjggMC03MiAzMi4yLTcyIDcydjI0OGMwIDMuNC4yIDYuNy43IDkuOS0uNSA3LS43IDE0LS43IDIxLjEgMCAxNzYuNyAxNDMuMyAzMjAgMzIwIDMyMCAxNjAuMSAwIDI5Mi43LTExNy41IDMxNi4zLTI3MUg4ODhjMzkuOCAwIDcyLTMyLjIgNzItNzJWNDk3YzAtMzkuOC0zMi4yLTcyLTcyLTcyek02OTYgNjgxaC0xLjFjLjcgNy42IDEuMSAxNS4yIDEuMSAyMyAwIDEzNy0xMTEgMjQ4LTI0OCAyNDhTMjAwIDg0MSAyMDAgNzA0YzAtNy44LjQtMTUuNCAxLjEtMjNIMjAwVjQyNWg0OTZ2MjU2em0xOTItOEg3NzZWNDk3aDExMnYxNzZ6TTYxMyAyODFjMTkuOSAwIDM2LTE2LjEgMzYtMzZWMzZjMC0xOS45LTE2LjEtMzYtMzYtMzZzLTM2IDE2LjEtMzYgMzZ2MjA5YzAgMTkuOSAxNi4xIDM2IDM2IDM2em0tMTcwIDBjMTkuOSAwIDM2LTE2LjEgMzYtMzZWMzZjMC0xOS45LTE2LjEtMzYtMzYtMzZzLTM2IDE2LjEtMzYgMzZ2MjA5YzAgMTkuOSAxNi4xIDM2IDM2IDM2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(CoffeeOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CoffeeOutlined';
}
var _default = exports.default = RefIcon;