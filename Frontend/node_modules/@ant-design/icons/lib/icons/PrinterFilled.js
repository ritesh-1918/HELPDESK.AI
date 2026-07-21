"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PrinterFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PrinterFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PrinterFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PrinterFilled.default
}));

/**![printer](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTczMiAxMjBjMC00LjQtMy42LTgtOC04SDMwMGMtNC40IDAtOCAzLjYtOCA4djE0OGg0NDBWMTIwem0xMjAgMjEySDE3MmMtNDQuMiAwLTgwIDM1LjgtODAgODB2MzI4YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDE2OHYxMzJjMCA0LjQgMy42IDggOCA4aDQyNGM0LjQgMCA4LTMuNiA4LThWNzcyaDE2OGMxNy43IDAgMzItMTQuMyAzMi0zMlY0MTJjMC00NC4yLTM1LjgtODAtODAtODB6TTY2NCA4NDRIMzYwVjU2OGgzMDR2Mjc2em0xNjQtMzYwYzAgNC40LTMuNiA4LTggOGgtNDBjLTQuNCAwLTgtMy42LTgtOHYtNDBjMC00LjQgMy42LTggOC04aDQwYzQuNCAwIDggMy42IDggOHY0MHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PrinterFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PrinterFilled';
}
var _default = exports.default = RefIcon;