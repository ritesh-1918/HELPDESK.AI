"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FileZipFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FileZipFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FileZipFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FileZipFilled.default
}));

/**![file-zip](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg1NC42IDI4OC43YzYgNiA5LjQgMTQuMSA5LjQgMjIuNlY5MjhjMCAxNy43LTE0LjMgMzItMzIgMzJIMTkyYy0xNy43IDAtMzItMTQuMy0zMi0zMlY5NmMwLTE3LjcgMTQuMy0zMiAzMi0zMmg0MjQuN2M4LjUgMCAxNi43IDMuNCAyMi43IDkuNGwyMTUuMiAyMTUuM3pNNzkwLjIgMzI2TDYwMiAxMzcuOFYzMjZoMTg4LjJ6TTI5NiAxMzZ2NjRoNjR2LTY0aC02NHptNjQgNjR2NjRoNjR2LTY0aC02NHptLTY0IDY0djY0aDY0di02NGgtNjR6bTY0IDY0djY0aDY0di02NGgtNjR6bS02NCA2NHY2NGg2NHYtNjRoLTY0em02NCA2NHY2NGg2NHYtNjRoLTY0em0tNjQgNjR2NjRoNjR2LTY0aC02NHptMCA2NHYxNjBoMTI4VjU4NEgyOTZ6bTQ4IDQ4aDMydjY0aC0zMnYtNjR6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(FileZipFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FileZipFilled';
}
var _default = exports.default = RefIcon;