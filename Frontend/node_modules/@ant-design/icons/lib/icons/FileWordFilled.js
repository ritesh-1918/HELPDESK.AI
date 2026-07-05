"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileWordFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileWordFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileWordFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileWordFilled.default
}));

/**![file-word](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDI4OC43YzYgNiA5LjQgMTQuMSA5LjQgMjIuNlY5MjhjMCAxNy43LTE0LjMgMzItMzIgMzJIMTkyYy0xNy43IDAtMzItMTQuMy0zMi0zMlY5NmMwLTE3LjcgMTQuMy0zMiAzMi0zMmg0MjQuN2M4LjUgMCAxNi43IDMuNCAyMi43IDkuNGwyMTUuMiAyMTUuM3pNNzkwLjIgMzI2TDYwMiAxMzcuOFYzMjZoMTg4LjJ6TTUxMiA1NjYuMWw1Mi44MSAxOTdhMTIgMTIgMCAwMDExLjYgOC45aDMxLjc3YTEyIDEyIDAgMDAxMS42LTguODhsNzQuMzctMjc2YTEyIDEyIDAgMDAuNC0zLjEyIDEyIDEyIDAgMDAtMTItMTJoLTM1LjU3YTEyIDEyIDAgMDAtMTEuNyA5LjMxbC00NS43OCAxOTkuMS00OS43Ni0xOTkuMzJBMTIgMTIgMCAwMDUyOC4xIDQ3MmgtMzIuMmExMiAxMiAwIDAwLTExLjY0IDkuMUw0MzQuNiA2ODAuMDEgMzg4LjUgNDgxLjNhMTIgMTIgMCAwMC0xMS42OC05LjI5aC0zNS4zOWExMiAxMiAwIDAwLTMuMTEuNDEgMTIgMTIgMCAwMC04LjQ3IDE0LjdsNzQuMTcgMjc2QTEyIDEyIDAgMDA0MTUuNiA3NzJoMzEuOTlhMTIgMTIgMCAwMDExLjU5LTguOWw1Mi44MS0xOTd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileWordFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileWordFilled';
}
var _default = exports.default = RefIcon;