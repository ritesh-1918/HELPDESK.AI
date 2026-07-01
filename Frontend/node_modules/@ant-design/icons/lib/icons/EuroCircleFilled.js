"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _EuroCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/EuroCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const EuroCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _EuroCircleFilled.default
}));

/**![euro-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em02My41IDM3NS44YzQuNCAwIDggMy42IDggOFY0NzVjMCA0LjQtMy42IDgtOCA4aC0xMzZjLS4zIDQuNC0uMyA5LjEtLjMgMTMuOHYzNmgxMzYuMmM0LjQgMCA4IDMuNiA4IDhWNTY4YzAgNC40LTMuNiA4LTggOEg0NDQuOWMxNS4zIDYyIDYxLjMgOTguNiAxMjkuOCA5OC42IDE5LjkgMCAzNy4xLTEuMiA1MS44LTQuMSA0LjktMSA5LjUgMi44IDkuNSA3Ljh2NDIuOGMwIDMuOC0yLjcgNy02LjQgNy44LTE1LjkgMy40LTM0LjMgNS4xLTU1LjMgNS4xLTEwOS44IDAtMTgzLTU4LjgtMjAwLjItMTU4SDM0NGMtNC40IDAtOC0zLjYtOC04di0yNy4yYzAtNC40IDMuNi04IDgtOGgyNi4xdi0zNi45YzAtNC40IDAtOC44LjMtMTIuOEgzNDRjLTQuNCAwLTgtMy42LTgtOHYtMjcuMmMwLTQuNCAzLjYtOCA4LThoMzEuN2MxOS43LTk0LjIgOTItMTQ5LjkgMTk4LjYtMTQ5LjkgMjAuOSAwIDM5LjQgMS45IDU1LjMgNS40IDMuNy44IDYuMyA0IDYuMyA3LjhWMzQ2aC4xYzAgNS4xLTQuNiA4LjgtOS42IDcuOC0xNC43LTIuOS0zMS44LTQuNC01MS43LTQuNC02NS40IDAtMTEwLjQgMzMuNS0xMjcuNiA5MC40aDEyOC40eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(EuroCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'EuroCircleFilled';
}
var _default = exports.default = RefIcon;