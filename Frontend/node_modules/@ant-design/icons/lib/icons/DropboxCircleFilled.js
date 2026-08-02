"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DropboxCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DropboxCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DropboxCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DropboxCircleFilled.default
}));

/**![dropbox-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTY2My44IDQ1NS41em0tMTUxLjUtOTMuOGwtMTUxLjggOTMuOCAxNTEuOCA5My45IDE1MS41LTkzLjl6TTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0xNTEuMiA1OTUuNUw1MTIuNiA3NTBsLTE1MS05MC41di0zMy4xbDQ1LjQgMjkuNCAxMDUuNi04Ny43IDEwNS42IDg3LjcgNDUuMS0yOS40djMzLjF6bS00NS42LTIyLjRsLTEwNS4zLTg3LjdMNDA3IDYzNy4xbC0xNTEtOTkuMiAxMDQuNS04Mi40TDI1NiAzNzEuMiA0MDcgMjc0bDEwNS4zIDg3LjdMNjE3LjYgMjc0IDc2OCAzNzIuMWwtMTA0LjIgODMuNUw3NjggNTM5bC0xNTAuNCA5OC4xeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DropboxCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DropboxCircleFilled';
}
var _default = exports.default = RefIcon;