"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _TikTokOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/TikTokOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const TikTokOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _TikTokOutlined.default
}));

/**![tik-tok](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTMwLjAxIDExMi42N2M0My42Ny0uNjcgODctLjM0IDEzMC4zMy0uNjcgMi42NyA1MSAyMSAxMDMgNTguMzMgMTM5IDM3LjMzIDM3IDkwIDU0IDE0MS4zMyA1OS42NlY0NDVjLTQ4LTEuNjctOTYuMzMtMTEuNjctMTQwLTMyLjM0LTE5LTguNjYtMzYuNjYtMTkuNjYtNTQtMzEtLjMzIDk3LjMzLjM0IDE5NC42Ny0uNjYgMjkxLjY3LTIuNjcgNDYuNjYtMTggOTMtNDUgMTMxLjMzLTQzLjY2IDY0LTExOS4zMiAxMDUuNjYtMTk2Ljk5IDEwNy00Ny42NiAyLjY2LTk1LjMzLTEwLjM0LTEzNi0zNC4zNEMyMjAuMDQgODM3LjY2IDE3Mi43IDc2NSAxNjUuNyA2ODdjLS42Ny0xNi42Ni0xLTMzLjMzLS4zNC00OS42NiA2LTYzLjM0IDM3LjMzLTEyNCA4Ni0xNjUuMzQgNTUuMzMtNDggMTMyLjY2LTcxIDIwNC45OS01Ny4zMy42NyA0OS4zNC0xLjMzIDk4LjY3LTEuMzMgMTQ4LTMzLTEwLjY3LTcxLjY3LTcuNjctMTAwLjY3IDEyLjMzLTIxIDEzLjY3LTM3IDM0LjY3LTQ1LjMzIDU4LjM0LTcgMTctNSAzNS42Ni00LjY2IDUzLjY2IDggNTQuNjcgNjAuNjYgMTAwLjY3IDExNi42NiA5NS42NyAzNy4zMy0uMzQgNzMtMjIgOTIuMzMtNTMuNjcgNi4zMy0xMSAxMy4zMy0yMi4zMyAxMy42Ni0zNS4zMyAzLjM0LTU5LjY3IDItMTE5IDIuMzQtMTc4LjY2LjMzLTEzNC4zNC0uMzQtMjY4LjMzLjY2LTQwMi4zMyIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(TikTokOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'TikTokOutlined';
}
var _default = exports.default = RefIcon;