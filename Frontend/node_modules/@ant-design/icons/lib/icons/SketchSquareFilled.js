"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SketchSquareFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/SketchSquareFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const SketchSquareFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _SketchSquareFilled.default
}));

/**![sketch-square](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYwOC4yIDQyMy4zTDUxMiAzMjYuMWwtOTYuMiA5Ny4yem0tMjUuOSAyMDIuM2wxNDcuOS0xNjYuM2gtNjMuNHptOTAtMjAyLjNoNjIuNWwtOTIuMS0xMTUuMXpNODgwIDExMkgxNDRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjczNmMwIDE3LjcgMTQuMyAzMiAzMiAzMmg3MzZjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTQ0YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tODEuMyAzMzIuMkw1MTUuOCA3NjIuM2MtMSAxLjEtMi40IDEuNy0zLjggMS43cy0yLjgtLjYtMy44LTEuN0wyMjUuMyA0NDQuMmE1LjE0IDUuMTQgMCAwMS0uMi02LjZMMzY1LjYgMjYyYzEtMS4yIDIuNC0xLjkgNC0xLjloMjg0LjZjMS42IDAgMyAuNyA0IDEuOWwxNDAuNSAxNzUuNmE0LjkgNC45IDAgMDEwIDYuNnptLTQwMS4xIDE1LjFMNTEyIDY4NC41bDExNC40LTIyNS4yem0tMTYuMy0xNTEuMWwtOTIuMSAxMTUuMWg2Mi41em0tODcuNSAxNTEuMWwxNDcuOSAxNjYuMy04NC41LTE2Ni4zem0xMjYuNS0xNTguMmwtMjMuMSA4OS44IDg4LjgtODkuOHptMTgzLjQgMEg1MzhsODguOCA4OS44eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(SketchSquareFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'SketchSquareFilled';
}
var _default = exports.default = RefIcon;