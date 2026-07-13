"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _WechatWorkOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/WechatWorkOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const WechatWorkOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _WechatWorkOutlined.default
}));

/**![wechat-work](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOTA5Ljc4IDcyOS41OWExMzUuODcgMTM1Ljg3IDAgMDAtNDcuMDQgMTkuMDQgMTE0LjI0IDExNC4yNCAwIDAxLTUxLjQgMzEuMDggNzYuMjkgNzYuMjkgMCAwMTI0LjQ1LTQ1LjQyIDE2OS4zIDE2OS4zIDAgMDAyMy40LTU1LjAyIDUwLjQxIDUwLjQxIDAgMTE1MC42IDUwLjMyem0tOTIuMjEtMTIwLjc2YTE2OC44MyAxNjguODMgMCAwMC01NC44MS0yMy42OCA1MC40MSA1MC40MSAwIDAxLTUwLjQtNTAuNDIgNTAuNDEgNTAuNDEgMCAxMTEwMC44IDAgMTM3LjUgMTM3LjUgMCAwMDE4LjgyIDQ3LjIgMTE0LjggMTE0LjggMCAwMTMwLjc2IDUxLjY2IDc2LjA4IDc2LjA4IDAgMDEtNDUuMDItMjQuNzZoLS4xOXptLTgzLjA0LTE3Ny43MWMtMTUuMTktMTI3LjMzLTE0Ni45OC0yMjcuMS0zMDYuNDQtMjI3LjEtMTY5Ljg3IDAtMzA4LjA5IDExMy4xLTMwOC4wOSAyNTIuMkEyMzUuODEgMjM1LjgxIDAgMDAyMzAuMDYgNjQ3LjZhMzExLjI4IDMxMS4yOCAwIDAwMzMuNiAyMS41OUwyNTAgNzIzLjc2YzQuOTMgMi4zMSA5LjcgNC43OCAxNC43NSA2LjlsNjktMzQuNWMxMC4wNyAyLjYxIDIwLjY4IDQuMyAzMS4yIDYuMDggNi43MyAxLjIgMTMuNDUgMi40MyAyMC4zNSAzLjI1YTM1NC44MyAzNTQuODMgMCAwMDEyOC44MS03LjQgMjQ4Ljg4IDI0OC44OCAwIDAwMTAuMTUgNTUuMDYgNDI1LjY0IDQyNS42NCAwIDAxLTk2LjE3IDExLjI0IDQxNy45OCA0MTcuOTggMCAwMS04Ni40LTkuNTJMMjE2LjUyIDgxNy40YTI3LjYyIDI3LjYyIDAgMDEtMjkuOTgtMy4xNCAyOC4wMiAyOC4wMiAwIDAxLTkuNjctMjguNjFsMjIuNC05MC4yNEEyOTIuMjYgMjkyLjI2IDAgMDE2NCA0NTYuMjFDNjQgMjg1Ljk4IDIyNyAxNDggNDI4LjA5IDE0OGMxOTAuOTMgMCAzNDcuMjkgMTI0LjUzIDM2Mi41MiAyODIuODJhMjQ0Ljk3IDI0NC45NyAwIDAwLTI2LjQ3LTIuNjJjLTkuOS4zOC0xOS43OSAxLjMxLTI5LjYgMi44OHptLTExNi4zIDE5OC44MWExMzUuNzYgMTM1Ljc2IDAgMDA0Ny4wNS0xOS4wNCAxMTQuMjQgMTE0LjI0IDAgMDE1MS40NS0zMSA3Ni40NyA3Ni40NyAwIDAxLTI0LjUgNDUuMzQgMTY5LjQ4IDE2OS40OCAwIDAwLTIzLjQgNTUuMDUgNTAuNDEgNTAuNDEgMCAwMS0xMDAuOC4yMyA1MC40MSA1MC40MSAwIDAxNTAuMi01MC41OG05MC44IDEyMS4zMmExNjguNiAxNjguNiAwIDAwNTQuNjYgMjMuOSA1MC40NCA1MC40NCAwIDAxMzUuNjQgODYuMDggNTAuMzggNTAuMzggMCAwMS04Ni4wNC0zNS42NiAxMzYuNzQgMTM2Ljc0IDAgMDAtMTguNjctNDcuMjggMTE0LjcxIDExNC43MSAwIDAxLTMwLjU0LTUxLjggNzYgNzYgMCAwMTQ0Ljk1IDI1LjA2eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(WechatWorkOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'WechatWorkOutlined';
}
var _default = exports.default = RefIcon;