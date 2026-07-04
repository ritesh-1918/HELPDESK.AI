"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TruckFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TruckFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TruckFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TruckFilled.default
}));

/**![truck](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjA4IDE5MmEzMiAzMiAwIDAxMzIgMzJ2MTYwaDE3NC44MWEzMiAzMiAwIDAxMjYuNjggMTQuMzNsMTEzLjE5IDE3MC44NGEzMiAzMiAwIDAxNS4zMiAxNy42OFY2NzJhMzIgMzIgMCAwMS0zMiAzMmgtOTZjMCA3MC43LTU3LjMgMTI4LTEyOCAxMjhzLTEyOC01Ny4zLTEyOC0xMjhIMzg0YzAgNzAuNy01Ny4zIDEyOC0xMjggMTI4cy0xMjgtNTcuMy0xMjgtMTI4SDk2YTMyIDMyIDAgMDEtMzItMzJWMjI0YTMyIDMyIDAgMDEzMi0zMnpNMjU2IDY0MGE2NCA2NCAwIDAwMCAxMjhoMS4wNkE2NCA2NCAwIDAwMjU2IDY0MG00NDggMGE2NCA2NCAwIDAwMCAxMjhoMS4wNkE2NCA2NCAwIDAwNzA0IDY0MG05My42My0xOTJINjQwdjE0NS4xMkExMjcuNDMgMTI3LjQzIDAgMDE3MDQgNTc2YzQ3LjM4IDAgODguNzUgMjUuNzQgMTEwLjg4IDY0SDg5NnYtNDMuNTJ6TTUwMCA0NDhIMzMyYTEyIDEyIDAgMDAtMTIgMTJ2NDBhMTIgMTIgMCAwMDEyIDEyaDE2OGExMiAxMiAwIDAwMTItMTJ2LTQwYTEyIDEyIDAgMDAtMTItMTJNMzA4IDMyMEgyMDRhMTIgMTIgMCAwMC0xMiAxMnY0MGExMiAxMiAwIDAwMTIgMTJoMTA0YTEyIDEyIDAgMDAxMi0xMnYtNDBhMTIgMTIgMCAwMC0xMi0xMiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(TruckFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TruckFilled';
}
var _default = exports.default = RefIcon;