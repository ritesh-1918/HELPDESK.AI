"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _MehTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/MehTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const MehTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _MehTwoTone.default
}));

/**![meh](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0wIDgyMGMtMjA1LjQgMC0zNzItMTY2LjYtMzcyLTM3MnMxNjYuNi0zNzIgMzcyLTM3MiAzNzIgMTY2LjYgMzcyIDM3Mi0xNjYuNiAzNzItMzcyIDM3MnoiIGZpbGw9IiMxNjc3ZmYiIC8+PHBhdGggZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwMTk2IDAgNDguMDEgNDguMDEgMCAwMS05NiAwem0zODQgMjAwYzAgNC40LTMuNiA4LTggOEgzNjBjLTQuNCAwLTgtMy42LTgtOHYtNDhjMC00LjQgMy42LTggOC04aDMwNGM0LjQgMCA4IDMuNiA4IDh2NDh6bTE2LTE1MmE0OC4wMSA0OC4wMSAwIDAxMC05NiA0OC4wMSA0OC4wMSAwIDAxMCA5NnoiIGZpbGw9IiNlNmY0ZmYiIC8+PHBhdGggZD0iTTI4OCA0MjFhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem0zNzYgMTQ0SDM2MGMtNC40IDAtOCAzLjYtOCA4djQ4YzAgNC40IDMuNiA4IDggOGgzMDRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LTh6bS0yNC0xNDRhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAweiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(MehTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'MehTwoTone';
}
var _default = exports.default = RefIcon;