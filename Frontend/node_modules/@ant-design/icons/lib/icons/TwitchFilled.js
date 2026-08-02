"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TwitchFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TwitchFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TwitchFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TwitchFilled.default
}));

/**![twitch](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgaGVpZ2h0PSIxMDIuMyUiIGlkPSJhIiB3aWR0aD0iMTAyLjMlIiB4PSItMS4yJSIgeT0iLTEuMiUiPjxmZU9mZnNldCBkeT0iMiIgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMSIgLz48ZmVHYXVzc2lhbkJsdXIgaW49InNoYWRvd09mZnNldE91dGVyMSIgcmVzdWx0PSJzaGFkb3dCbHVyT3V0ZXIxIiBzdGREZXZpYXRpb249IjIiIC8+PGZlQ29sb3JNYXRyaXggaW49InNoYWRvd0JsdXJPdXRlcjEiIHJlc3VsdD0ic2hhZG93TWF0cml4T3V0ZXIxIiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuNSAwIiAvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0ic2hhZG93TWF0cml4T3V0ZXIxIiAvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIgLz48L2ZlTWVyZ2U+PC9maWx0ZXI+PC9kZWZzPjxnIGZpbHRlcj0idXJsKCNhKSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOSA5KSI+PHBhdGggZD0iTTE4NS4xNCAxMTJMMTI4IDI1NC44NlY3OTcuN2gxNzEuNDNWOTEySDQxMy43TDUyOCA3OTcuNzFoMTQyLjg2bDIwMC0yMDBWMTEyem0zMTQuMjkgNDI4LjU3SDQxMy43VjMxMC4yMWg4NS43MnptMjAwIDBINjEzLjdWMzEwLjIxaDg1LjcyeiIgLz48L2c+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(TwitchFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TwitchFilled';
}
var _default = exports.default = RefIcon;