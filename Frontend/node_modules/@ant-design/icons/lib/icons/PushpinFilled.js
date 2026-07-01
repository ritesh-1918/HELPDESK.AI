"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PushpinFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PushpinFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PushpinFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PushpinFilled.default
}));

/**![pushpin](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg3OC4zIDM5Mi4xTDYzMS45IDE0NS43Yy02LjUtNi41LTE1LTkuNy0yMy41LTkuN3MtMTcgMy4yLTIzLjUgOS43TDQyMy44IDMwNi45Yy0xMi4yLTEuNC0yNC41LTItMzYuOC0yLTczLjIgMC0xNDYuNCAyNC4xLTIwNi41IDcyLjMtMTUuNCAxMi4zLTE2LjYgMzUuNC0yLjcgNDkuNGwxODEuNyAxODEuNy0yMTUuNCAyMTUuMmExNS44IDE1LjggMCAwMC00LjYgOS44bC0zLjQgMzcuMmMtLjkgOS40IDYuNiAxNy40IDE1LjkgMTcuNC41IDAgMSAwIDEuNS0uMWwzNy4yLTMuNGMzLjctLjMgNy4yLTIgOS44LTQuNmwyMTUuNC0yMTUuNCAxODEuNyAxODEuN2M2LjUgNi41IDE1IDkuNyAyMy41IDkuNyA5LjcgMCAxOS4zLTQuMiAyNS45LTEyLjQgNTYuMy03MC4zIDc5LjctMTU4LjMgNzAuMi0yNDMuNGwxNjEuMS0xNjEuMWMxMi45LTEyLjggMTIuOS0zMy44IDAtNDYuOHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(PushpinFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PushpinFilled';
}
var _default = exports.default = RefIcon;