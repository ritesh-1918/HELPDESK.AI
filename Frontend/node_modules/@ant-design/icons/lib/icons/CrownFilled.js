"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CrownFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/CrownFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const CrownFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _CrownFilled.default
}));

/**![crown](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg5OS42IDI3Ni41TDcwNSAzOTYuNCA1MTguNCAxNDcuNWE4LjA2IDguMDYgMCAwMC0xMi45IDBMMzE5IDM5Ni40IDEyNC4zIDI3Ni41Yy01LjctMy41LTEzLjEgMS4yLTEyLjIgNy45TDE4OC41IDg2NWMxLjEgNy45IDcuOSAxNCAxNiAxNGg2MTUuMWM4IDAgMTQuOS02IDE1LjktMTRsNzYuNC01ODAuNmMuOC02LjctNi41LTExLjQtMTIuMy03Ljl6TTUxMiA3MzQuMmMtNjIuMSAwLTExMi42LTUwLjUtMTEyLjYtMTEyLjZTNDQ5LjkgNTA5IDUxMiA1MDlzMTEyLjYgNTAuNSAxMTIuNiAxMTIuNlM1NzQuMSA3MzQuMiA1MTIgNzM0LjJ6bTAtMTYwLjljLTI2LjYgMC00OC4yIDIxLjYtNDguMiA0OC4zIDAgMjYuNiAyMS42IDQ4LjMgNDguMiA0OC4zczQ4LjItMjEuNiA0OC4yLTQ4LjNjMC0yNi42LTIxLjYtNDguMy00OC4yLTQ4LjN6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(CrownFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'CrownFilled';
}
var _default = exports.default = RefIcon;