"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _BulbTwoTone = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/BulbTwoTone"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const BulbTwoTone = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _BulbTwoTone.default
}));

/**![bulb](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiAxMzZjLTE0MS40IDAtMjU2IDExNC42LTI1NiAyNTYgMCA5Mi41IDQ5LjQgMTc2LjMgMTI4LjEgMjIxLjhsMzUuOSAyMC44Vjc1MmgxODRWNjM0LjZsMzUuOS0yMC44QzcxOC42IDU2OC4zIDc2OCA0ODQuNSA3NjggMzkyYzAtMTQxLjQtMTE0LjYtMjU2LTI1Ni0yNTZ6IiBmaWxsPSIjZTZmNGZmIiAvPjxwYXRoIGQ9Ik02MzIgODg4SDM5MmMtNC40IDAtOCAzLjYtOCA4djMyYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDE5MmMxNy43IDAgMzItMTQuMyAzMi0zMnYtMzJjMC00LjQtMy42LTgtOC04ek01MTIgNjRjLTE4MS4xIDAtMzI4IDE0Ni45LTMyOCAzMjggMCAxMjEuNCA2NiAyMjcuNCAxNjQgMjg0LjFWNzkyYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDI2NGMxNy43IDAgMzItMTQuMyAzMi0zMlY2NzYuMWM5OC01Ni43IDE2NC0xNjIuNyAxNjQtMjg0LjEgMC0xODEuMS0xNDYuOS0zMjgtMzI4LTMyOHptMTI3LjkgNTQ5LjhMNjA0IDYzNC42Vjc1Mkg0MjBWNjM0LjZsLTM1LjktMjAuOEMzMDUuNCA1NjguMyAyNTYgNDg0LjUgMjU2IDM5MmMwLTE0MS40IDExNC42LTI1NiAyNTYtMjU2czI1NiAxMTQuNiAyNTYgMjU2YzAgOTIuNS00OS40IDE3Ni4zLTEyOC4xIDIyMS44eiIgZmlsbD0iIzE2NzdmZiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(BulbTwoTone);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'BulbTwoTone';
}
var _default = exports.default = RefIcon;