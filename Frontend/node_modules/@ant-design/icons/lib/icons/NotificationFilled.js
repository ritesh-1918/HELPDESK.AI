"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _NotificationFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/NotificationFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const NotificationFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _NotificationFilled.default
}));

/**![notification](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJjLTMuOCAwLTcuNy43LTExLjYgMi4zTDI5MiAzNDUuOUgxMjhjLTguOCAwLTE2IDcuNC0xNiAxNi42djI5OWMwIDkuMiA3LjIgMTYuNiAxNiAxNi42aDEwMS42Yy0zLjcgMTEuNi01LjYgMjMuOS01LjYgMzYuNCAwIDY1LjkgNTMuOCAxMTkuNSAxMjAgMTE5LjUgNTUuNCAwIDEwMi4xLTM3LjYgMTE1LjktODguNGw0MDguNiAxNjQuMmMzLjkgMS41IDcuOCAyLjMgMTEuNiAyLjMgMTYuOSAwIDMyLTE0LjIgMzItMzMuMlYxNDUuMkM5MTIgMTI2LjIgODk3IDExMiA4ODAgMTEyek0zNDQgNzYyLjNjLTI2LjUgMC00OC0yMS40LTQ4LTQ3LjggMC0xMS4yIDMuOS0yMS45IDExLTMwLjRsODQuOSAzNC4xYy0yIDI0LjYtMjIuNyA0NC4xLTQ3LjkgNDQuMXoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(NotificationFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'NotificationFilled';
}
var _default = exports.default = RefIcon;