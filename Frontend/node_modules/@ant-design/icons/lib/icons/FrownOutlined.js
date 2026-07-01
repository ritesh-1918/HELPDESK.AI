"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _FrownOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/FrownOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const FrownOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _FrownOutlined.default
}));

/**![frown](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4OCA0MjFhNDggNDggMCAxMDk2IDAgNDggNDggMCAxMC05NiAwem0zNTIgMGE0OCA0OCAwIDEwOTYgMCA0OCA0OCAwIDEwLTk2IDB6TTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0yNjMgNzExYy0zNC4yIDM0LjItNzQgNjEtMTE4LjMgNzkuOEM2MTEgODc0LjIgNTYyLjMgODg0IDUxMiA4ODRjLTUwLjMgMC05OS05LjgtMTQ0LjgtMjkuMkEzNzAuNCAzNzAuNCAwIDAxMjQ4LjkgNzc1Yy0zNC4yLTM0LjItNjEtNzQtNzkuOC0xMTguM0MxNDkuOCA2MTEgMTQwIDU2Mi4zIDE0MCA1MTJzOS44LTk5IDI5LjItMTQ0LjhBMzcwLjQgMzcwLjQgMCAwMTI0OSAyNDguOWMzNC4yLTM0LjIgNzQtNjEgMTE4LjMtNzkuOEM0MTMgMTQ5LjggNDYxLjcgMTQwIDUxMiAxNDBjNTAuMyAwIDk5IDkuOCAxNDQuOCAyOS4yQTM3MC40IDM3MC40IDAgMDE3NzUuMSAyNDljMzQuMiAzNC4yIDYxIDc0IDc5LjggMTE4LjNDODc0LjIgNDEzIDg4NCA0NjEuNyA4ODQgNTEycy05LjggOTktMjkuMiAxNDQuOEEzNjguODkgMzY4Ljg5IDAgMDE3NzUgNzc1ek01MTIgNTMzYy04NS41IDAtMTU1LjYgNjcuMy0xNjAgMTUxLjZhOCA4IDAgMDA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNEM0MjAgNjM2LjEgNDYxLjUgNTk3IDUxMiA1OTdzOTIuMSAzOS4xIDk1LjggODguNmMuMyA0LjIgMy45IDcuNCA4LjEgNy40SDY2NGE4IDggMCAwMDgtOC40QzY2Ny42IDYwMC4zIDU5Ny41IDUzMyA1MTIgNTMzeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(FrownOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'FrownOutlined';
}
var _default = exports.default = RefIcon;