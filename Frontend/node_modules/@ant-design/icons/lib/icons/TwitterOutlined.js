"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TwitterOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TwitterOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TwitterOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TwitterOutlined.default
}));

/**![twitter](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyOCAyNTQuM2MtMzAuNiAxMy4yLTYzLjkgMjIuNy05OC4yIDI2LjRhMTcwLjEgMTcwLjEgMCAwMDc1LTk0IDMzNi42NCAzMzYuNjQgMCAwMS0xMDguMiA0MS4yQTE3MC4xIDE3MC4xIDAgMDA2NzIgMTc0Yy05NC41IDAtMTcwLjUgNzYuNi0xNzAuNSAxNzAuNiAwIDEzLjIgMS42IDI2LjQgNC4yIDM5LjEtMTQxLjUtNy40LTI2Ny43LTc1LTM1MS42LTE3OC41YTE2OS4zMiAxNjkuMzIgMCAwMC0yMy4yIDg2LjFjMCA1OS4yIDMwLjEgMTExLjQgNzYgMTQyLjFhMTcyIDE3MiAwIDAxLTc3LjEtMjEuN3YyLjFjMCA4Mi45IDU4LjYgMTUxLjYgMTM2LjcgMTY3LjRhMTgwLjYgMTgwLjYgMCAwMS00NC45IDUuOGMtMTEuMSAwLTIxLjYtMS4xLTMyLjItMi42QzIxMSA2NTIgMjczLjkgNzAxLjEgMzQ4LjggNzAyLjdjLTU4LjYgNDUuOS0xMzIgNzIuOS0yMTEuNyA3Mi45LTE0LjMgMC0yNy41LS41LTQxLjItMi4xQzE3MS41IDgyMiAyNjEuMiA4NTAgMzU3LjggODUwIDY3MS40IDg1MCA4NDMgNTkwLjIgODQzIDM2NC43YzAtNy40IDAtMTQuOC0uNS0yMi4yIDMzLjItMjQuMyA2Mi4zLTU0LjQgODUuNS04OC4yeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(TwitterOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TwitterOutlined';
}
var _default = exports.default = RefIcon;