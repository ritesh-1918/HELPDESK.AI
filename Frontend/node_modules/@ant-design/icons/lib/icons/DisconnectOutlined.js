"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DisconnectOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/DisconnectOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const DisconnectOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _DisconnectOutlined.default
}));

/**![disconnect](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTgzMi42IDE5MS40Yy04NC42LTg0LjYtMjIxLjUtODQuNi0zMDYgMGwtOTYuOSA5Ni45IDUxIDUxIDk2LjktOTYuOWM1My44LTUzLjggMTQ0LjYtNTkuNSAyMDQgMCA1OS41IDU5LjUgNTMuOCAxNTAuMiAwIDIwNGwtOTYuOSA5Ni45IDUxLjEgNTEuMSA5Ni45LTk2LjljODQuNC04NC42IDg0LjQtMjIxLjUtLjEtMzA2LjF6TTQ0Ni41IDc4MS42Yy01My44IDUzLjgtMTQ0LjYgNTkuNS0yMDQgMC01OS41LTU5LjUtNTMuOC0xNTAuMiAwLTIwNGw5Ni45LTk2LjktNTEuMS01MS4xLTk2LjkgOTYuOWMtODQuNiA4NC42LTg0LjYgMjIxLjUgMCAzMDZzMjIxLjUgODQuNiAzMDYgMGw5Ni45LTk2LjktNTEtNTEtOTYuOCA5N3pNMjYwLjMgMjA5LjRhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDIwOS40IDI0OWE4LjAzIDguMDMgMCAwMDAgMTEuM2w1NTQuNCA1NTQuNGMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDM5LjYtMzkuNmMzLjEtMy4xIDMuMS04LjIgMC0xMS4zTDI2MC4zIDIwOS40eiIgLz48L3N2Zz4=) */
const RefIcon = /*#__PURE__*/React.forwardRef(DisconnectOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'DisconnectOutlined';
}
var _default = exports.default = RefIcon;