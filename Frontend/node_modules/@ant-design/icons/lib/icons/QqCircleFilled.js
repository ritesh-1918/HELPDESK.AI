"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _QqCircleFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/QqCircleFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const QqCircleFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _QqCircleFilled.default
}));

/**![qq-circle](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUxMiA2NEMyNjQuNiA2NCA2NCAyNjQuNiA2NCA1MTJzMjAwLjYgNDQ4IDQ0OCA0NDggNDQ4LTIwMC42IDQ0OC00NDhTNzU5LjQgNjQgNTEyIDY0em0yMTAuNSA2MTIuNGMtMTEuNSAxLjQtNDQuOS01Mi43LTQ0LjktNTIuNyAwIDMxLjMtMTYuMiA3Mi4yLTUxLjEgMTAxLjggMTYuOSA1LjIgNTQuOSAxOS4yIDQ1LjkgMzQuNC03LjMgMTIuMy0xMjUuNiA3LjktMTU5LjggNC0zNC4yIDMuOC0xNTIuNSA4LjMtMTU5LjgtNC05LjEtMTUuMiAyOC45LTI5LjIgNDUuOC0zNC40LTM1LTI5LjUtNTEuMS03MC40LTUxLjEtMTAxLjggMCAwLTMzLjQgNTQuMS00NC45IDUyLjctNS40LS43LTEyLjQtMjkuNiA5LjQtOTkuNyAxMC4zLTMzIDIyLTYwLjUgNDAuMi0xMDUuOC0zLjEtMTE2LjkgNDUuMy0yMTUgMTYwLjQtMjE1IDExMy45IDAgMTYzLjMgOTYuMSAxNjAuNCAyMTUgMTguMSA0NS4yIDI5LjkgNzIuOCA0MC4yIDEwNS44IDIxLjcgNzAuMSAxNC42IDk5LjEgOS4zIDk5Ljd6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(QqCircleFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'QqCircleFilled';
}
var _default = exports.default = RefIcon;