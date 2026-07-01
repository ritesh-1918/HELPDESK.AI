"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ExperimentFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ExperimentFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ExperimentFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ExperimentFilled.default
}));

/**![experiment](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIxOC45IDYzNi4zbDQyLjYgMjYuNmMuMS4xLjMuMi40LjNsMTIuNyA4IC4zLjNhMTg2LjkgMTg2LjkgMCAwMDk0LjEgMjUuMWM0NC45IDAgODcuMi0xNS43IDEyMS00My44YTI1Ni4yNyAyNTYuMjcgMCAwMTE2NC45LTU5LjljNTIuMyAwIDEwMi4yIDE1LjcgMTQ0LjYgNDQuNWw3LjkgNS0xMTEuNi0yODlWMTc5LjhoNjMuNWM0LjQgMCA4LTMuNiA4LThWMTIwYzAtNC40LTMuNi04LTgtOEgyNjQuN2MtNC40IDAtOCAzLjYtOCA4djUxLjljMCA0LjQgMy42IDggOCA4aDYzLjV2MTczLjZMMjE4LjkgNjM2LjN6bTMzMy0yMDMuMWMyMiAwIDM5LjkgMTcuOSAzOS45IDM5LjlTNTczLjkgNTEzIDU1MS45IDUxMyA1MTIgNDk1LjEgNTEyIDQ3My4xczE3LjktMzkuOSAzOS45LTM5Ljl6TTg3OCA4MjUuMWwtMjkuOS03Ny40LTg1LjctNTMuNS0uMS4xYy0uNy0uNS0xLjUtMS0yLjItMS41bC04LjEtNS0uMy0uM2MtMjktMTcuNS02Mi4zLTI2LjgtOTctMjYuOC00NC45IDAtODcuMiAxNS43LTEyMSA0My44YTI1Ni4yNyAyNTYuMjcgMCAwMS0xNjQuOSA1OS45Yy01MyAwLTEwMy41LTE2LjEtMTQ2LjItNDUuNmwtMjguOS0xOC4xTDE0NiA4MjUuMWMtMi44IDcuNC00LjMgMTUuMi00LjMgMjMgMCAzNS4yIDI4LjYgNjMuOCA2My44IDYzLjhoNjEyLjljNy45IDAgMTUuNy0xLjUgMjMtNC4zYTYzLjYgNjMuNiAwIDAwMzYuNi04Mi41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(ExperimentFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ExperimentFilled';
}
var _default = exports.default = RefIcon;