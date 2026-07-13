"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TagOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TagOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TagOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TagOutlined.default
}));

/**![tag](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkzOCA0NTguOGwtMjkuNi0zMTIuNmMtMS41LTE2LjItMTQuNC0yOS0zMC42LTMwLjZMNTY1LjIgODZoLS40Yy0zLjIgMC01LjcgMS03LjYgMi45TDg4LjkgNTU3LjJhOS45NiA5Ljk2IDAgMDAwIDE0LjFsMzYzLjggMzYzLjhjMS45IDEuOSA0LjQgMi45IDcuMSAyLjlzNS4yLTEgNy4xLTIuOWw0NjguMy00NjguM2MyLTIuMSAzLTUgMi44LTh6TTQ1OS43IDgzNC43TDE4OS4zIDU2NC4zIDU4OSAxNjQuNiA4MzYgMTg4bDIzLjQgMjQ3LTM5OS43IDM5OS43ek02ODAgMjU2Yy00OC41IDAtODggMzkuNS04OCA4OHMzOS41IDg4IDg4IDg4IDg4LTM5LjUgODgtODgtMzkuNS04OC04OC04OHptMCAxMjBjLTE3LjcgMC0zMi0xNC4zLTMyLTMyczE0LjMtMzIgMzItMzIgMzIgMTQuMyAzMiAzMi0xNC4zIDMyLTMyIDMyeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(TagOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TagOutlined';
}
var _default = exports.default = RefIcon;