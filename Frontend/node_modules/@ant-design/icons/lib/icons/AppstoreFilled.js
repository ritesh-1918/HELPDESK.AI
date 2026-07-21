"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AppstoreFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AppstoreFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AppstoreFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AppstoreFilled.default
}));

/**![appstore](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg2NCAxNDRINTYwYy04LjggMC0xNiA3LjItMTYgMTZ2MzA0YzAgOC44IDcuMiAxNiAxNiAxNmgzMDRjOC44IDAgMTYtNy4yIDE2LTE2VjE2MGMwLTguOC03LjItMTYtMTYtMTZ6bTAgNDAwSDU2MGMtOC44IDAtMTYgNy4yLTE2IDE2djMwNGMwIDguOCA3LjIgMTYgMTYgMTZoMzA0YzguOCAwIDE2LTcuMiAxNi0xNlY1NjBjMC04LjgtNy4yLTE2LTE2LTE2ek00NjQgMTQ0SDE2MGMtOC44IDAtMTYgNy4yLTE2IDE2djMwNGMwIDguOCA3LjIgMTYgMTYgMTZoMzA0YzguOCAwIDE2LTcuMiAxNi0xNlYxNjBjMC04LjgtNy4yLTE2LTE2LTE2em0wIDQwMEgxNjBjLTguOCAwLTE2IDcuMi0xNiAxNnYzMDRjMCA4LjggNy4yIDE2IDE2IDE2aDMwNGM4LjggMCAxNi03LjIgMTYtMTZWNTYwYzAtOC44LTcuMi0xNi0xNi0xNnoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(AppstoreFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AppstoreFilled';
}
var _default = exports.default = RefIcon;