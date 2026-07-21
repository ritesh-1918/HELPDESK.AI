"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ImportOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ImportOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ImportOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ImportOutlined.default
}));

/**![import](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODgwIDkxMkgxNDRjLTE3LjcgMC0zMi0xNC4zLTMyLTMyVjE0NGMwLTE3LjcgMTQuMy0zMiAzMi0zMmgzNjBjNC40IDAgOCAzLjYgOCA4djU2YzAgNC40LTMuNiA4LTggOEgxODR2NjU2aDY1NlY1MjBjMC00LjQgMy42LTggOC04aDU2YzQuNCAwIDggMy42IDggOHYzNjBjMCAxNy43LTE0LjMgMzItMzIgMzJ6TTY1My4zIDQyNC42bDUyLjIgNTIuMmE4LjAxIDguMDEgMCAwMS00LjcgMTMuNmwtMTc5LjQgMjFjLTUuMS42LTkuNS0zLjctOC45LTguOWwyMS0xNzkuNGMuOC02LjYgOC45LTkuNCAxMy42LTQuN2w1Mi40IDUyLjQgMjU2LjItMjU2LjJjMy4xLTMuMSA4LjItMy4xIDExLjMgMGw0Mi40IDQyLjRjMy4xIDMuMSAzLjEgOC4yIDAgMTEuM0w2NTMuMyA0MjQuNnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ImportOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ImportOutlined';
}
var _default = exports.default = RefIcon;