"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ShoppingCartOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ShoppingCartOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ShoppingCartOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ShoppingCartOutlined.default
}));

/**![shopping-cart](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyMi45IDcwMS45SDMyNy40bDI5LjktNjAuOSA0OTYuOC0uOWMxNi44IDAgMzEuMi0xMiAzNC4yLTI4LjZsNjguOC0zODUuMWMxLjgtMTAuMS0uOS0yMC41LTcuNS0yOC40YTM0Ljk5IDM0Ljk5IDAgMDAtMjYuNi0xMi41bC02MzItMi4xLTUuNC0yNS40Yy0zLjQtMTYuMi0xOC0yOC0zNC42LTI4SDk2LjVhMzUuMyAzNS4zIDAgMTAwIDcwLjZoMTI1LjlMMjQ2IDMxMi44bDU4LjEgMjgxLjMtNzQuOCAxMjIuMWEzNC45NiAzNC45NiAwIDAwLTMgMzYuOGM2IDExLjkgMTguMSAxOS40IDMxLjUgMTkuNGg2Mi44YTEwMi40MyAxMDIuNDMgMCAwMC0yMC42IDYxLjdjMCA1Ni42IDQ2IDEwMi42IDEwMi42IDEwMi42czEwMi42LTQ2IDEwMi42LTEwMi42YzAtMjIuMy03LjQtNDQtMjAuNi02MS43aDE2MS4xYTEwMi40MyAxMDIuNDMgMCAwMC0yMC42IDYxLjdjMCA1Ni42IDQ2IDEwMi42IDEwMi42IDEwMi42czEwMi42LTQ2IDEwMi42LTEwMi42YzAtMjIuMy03LjQtNDQtMjAuNi02MS43SDkyM2MxOS40IDAgMzUuMy0xNS44IDM1LjMtMzUuM2EzNS40MiAzNS40MiAwIDAwLTM1LjQtMzUuMnpNMzA1LjcgMjUzbDU3NS44IDEuOS01Ni40IDMxNS44LTQ1Mi4zLjhMMzA1LjcgMjUzem05Ni45IDYxMi43Yy0xNy40IDAtMzEuNi0xNC4yLTMxLjYtMzEuNiAwLTE3LjQgMTQuMi0zMS42IDMxLjYtMzEuNnMzMS42IDE0LjIgMzEuNiAzMS42YTMxLjYgMzEuNiAwIDAxLTMxLjYgMzEuNnptMzI1LjEgMGMtMTcuNCAwLTMxLjYtMTQuMi0zMS42LTMxLjYgMC0xNy40IDE0LjItMzEuNiAzMS42LTMxLjZzMzEuNiAxNC4yIDMxLjYgMzEuNmEzMS42IDMxLjYgMCAwMS0zMS42IDMxLjZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(ShoppingCartOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ShoppingCartOutlined';
}
var _default = exports.default = RefIcon;