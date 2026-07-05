"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _RotateRightOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/RotateRightOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const RotateRightOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _RotateRightOutlined.default
}));

/**![rotate-right](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik00ODAuNSAyNTEuMmMxMy0xLjYgMjUuOS0yLjQgMzguOC0yLjV2NjMuOWMwIDYuNSA3LjUgMTAuMSAxMi42IDYuMUw2NjAgMjE3LjZjNC0zLjIgNC05LjIgMC0xMi4zbC0xMjgtMTAxYy01LjEtNC0xMi42LS40LTEyLjYgNi4xbC0uMiA2NGMtMTE4LjYuNS0yMzUuOCA1My40LTMxNC42IDE1NC4yQTM5OS43NSAzOTkuNzUgMCAwMDEyMy41IDYzMWg3NC45Yy0uOS01LjMtMS43LTEwLjctMi40LTE2LjEtNS4xLTQyLjEtMi4xLTg0LjEgOC45LTEyNC44IDExLjQtNDIuMiAzMS04MS4xIDU4LjEtMTE1LjggMjcuMi0zNC43IDYwLjMtNjMuMiA5OC40LTg0LjMgMzctMjAuNiA3Ni45LTMzLjYgMTE5LjEtMzguOHoiIC8+PHBhdGggZD0iTTg4MCA0MThIMzUyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY0MTRjMCAxNy43IDE0LjMgMzIgMzIgMzJoNTI4YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjQ1MGMwLTE3LjctMTQuMy0zMi0zMi0zMnptLTQ0IDQwMkgzOTZWNDk0aDQ0MHYzMjZ6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(RotateRightOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'RotateRightOutlined';
}
var _default = exports.default = RefIcon;