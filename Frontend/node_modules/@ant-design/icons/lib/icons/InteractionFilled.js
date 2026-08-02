"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _InteractionFilled = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/InteractionFilled"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const InteractionFilled = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _InteractionFilled.default
}));

/**![interaction](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTg4MCAxMTJIMTQ0Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY3MzZjMCAxNy43IDE0LjMgMzIgMzIgMzJoNzM2YzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE0NGMwLTE3LjctMTQuMy0zMi0zMi0zMnpNNzI2IDU4NS43YzAgNTUuMy00NC43IDEwMC4xLTk5LjcgMTAwLjFINDIwLjZ2NTMuNGMwIDUuNy02LjUgOC44LTEwLjkgNS4zbC0xMDkuMS04NS43Yy0zLjUtMi43LTMuNS04IDAtMTAuN2wxMDkuMS04NS43YzQuNC0zLjUgMTAuOS0uMyAxMC45IDUuM3Y1My40aDIwNS43YzE5LjYgMCAzNS41LTE2IDM1LjUtMzUuNnYtNzguOWMwLTMuNyAzLTYuOCA2LjgtNi44aDUwLjdjMy43IDAgNi44IDMgNi44IDYuOHY3OS4xem0tMi42LTIwOS45bC0xMDkuMSA4NS43Yy00LjQgMy41LTEwLjkuMy0xMC45LTUuM3YtNTMuNEgzOTcuN2MtMTkuNiAwLTM1LjUgMTYtMzUuNSAzNS42djc4LjljMCAzLjctMyA2LjgtNi44IDYuOGgtNTAuN2MtMy43IDAtNi44LTMtNi44LTYuOHYtNzguOWMwLTU1LjMgNDQuNy0xMDAuMSA5OS43LTEwMC4xaDIwNS43di01My40YzAtNS43IDYuNS04LjggMTAuOS01LjNsMTA5LjEgODUuN2MzLjYgMi41IDMuNiA3LjguMSAxMC41eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(InteractionFilled);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'InteractionFilled';
}
var _default = exports.default = RefIcon;