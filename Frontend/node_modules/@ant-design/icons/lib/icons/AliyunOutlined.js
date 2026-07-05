"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _AliyunOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/AliyunOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const AliyunOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _AliyunOutlined.default
}));

/**![aliyun](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTk1OS4yIDM4My45Yy0uMy04Mi4xLTY2LjktMTQ4LjYtMTQ5LjEtMTQ4LjZINTc1LjlsMjEuNiA4NS4yIDIwMSA0My43YTQyLjU4IDQyLjU4IDAgMDEzMi45IDM5LjdjLjEuNS4xIDIxNi4xIDAgMjE2LjZhNDIuNTggNDIuNTggMCAwMS0zMi45IDM5LjdsLTIwMSA0My43LTIxLjYgODUuM2gyMzQuMmM4Mi4xIDAgMTQ4LjgtNjYuNSAxNDkuMS0xNDguNlYzODMuOXpNMjI1LjUgNjYwLjRhNDIuNTggNDIuNTggMCAwMS0zMi45LTM5LjdjLS4xLS42LS4xLTIxNi4xIDAtMjE2LjYuOC0xOS40IDE0LjYtMzUuNSAzMi45LTM5LjdsMjAxLTQzLjcgMjEuNi04NS4ySDIxMy44Yy04Mi4xIDAtMTQ4LjggNjYuNC0xNDkuMSAxNDguNlY2NDFjLjMgODIuMSA2NyAxNDguNiAxNDkuMSAxNDguNkg0NDhsLTIxLjYtODUuMy0yMDAuOS00My45em0yMDAuOS0xNTguOGgxNzF2MjEuM2gtMTcxeiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(AliyunOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'AliyunOutlined';
}
var _default = exports.default = RefIcon;