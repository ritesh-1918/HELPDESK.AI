"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _OrderedListOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/OrderedListOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const OrderedListOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _OrderedListOutlined.default
}));

/**![ordered-list](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyMCA3NjBIMzM2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDU4NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHptMC01NjhIMzM2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDU4NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHptMCAyODRIMzM2Yy00LjQgMC04IDMuNi04IDh2NTZjMCA0LjQgMy42IDggOCA4aDU4NGM0LjQgMCA4LTMuNiA4LTh2LTU2YzAtNC40LTMuNi04LTgtOHpNMjE2IDcxMkgxMDBjLTIuMiAwLTQgMS44LTQgNHYzNGMwIDIuMiAxLjggNCA0IDRoNzIuNHYyMC41aC0zNS43Yy0yLjIgMC00IDEuOC00IDR2MzRjMCAyLjIgMS44IDQgNCA0aDM1LjdWODM4SDEwMGMtMi4yIDAtNCAxLjgtNCA0djM0YzAgMi4yIDEuOCA0IDQgNGgxMTZjMi4yIDAgNC0xLjggNC00VjcxNmMwLTIuMi0xLjgtNC00LTR6TTEwMCAxODhoMzh2MTIwYzAgMi4yIDEuOCA0IDQgNGg0MGMyLjIgMCA0LTEuOCA0LTRWMTUyYzAtNC40LTMuNi04LTgtOGgtNzhjLTIuMiAwLTQgMS44LTQgNHYzNmMwIDIuMiAxLjggNCA0IDR6bTExNiAyNDBIMTAwYy0yLjIgMC00IDEuOC00IDR2MzZjMCAyLjIgMS44IDQgNCA0aDY4LjRsLTcwLjMgNzcuN2E4LjMgOC4zIDAgMDAtMi4xIDUuNFY1OTJjMCAyLjIgMS44IDQgNCA0aDExNmMyLjIgMCA0LTEuOCA0LTR2LTM2YzAtMi4yLTEuOC00LTQtNGgtNjguNGw3MC4zLTc3LjdhOC4zIDguMyAwIDAwMi4xLTUuNFY0MzJjMC0yLjItMS44LTQtNC00eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(OrderedListOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'OrderedListOutlined';
}
var _default = exports.default = RefIcon;