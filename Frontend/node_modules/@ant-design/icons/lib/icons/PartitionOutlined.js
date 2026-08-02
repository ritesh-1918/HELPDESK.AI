"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PartitionOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/PartitionOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const PartitionOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _PartitionOutlined.default
}));

/**![partition](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlIC8+PC9kZWZzPjxwYXRoIGQ9Ik02NDAuNiA0MjkuOGgyNTcuMWM3LjkgMCAxNC4zLTYuNCAxNC4zLTE0LjNWMTU4LjNjMC03LjktNi40LTE0LjMtMTQuMy0xNC4zSDY0MC42Yy03LjkgMC0xNC4zIDYuNC0xNC4zIDE0LjN2OTIuOUg0OTAuNmMtMy45IDAtNy4xIDMuMi03LjEgNy4xdjIyMS41aC04NS43di05Ni41YzAtNy45LTYuNC0xNC4zLTE0LjMtMTQuM0gxMjYuM2MtNy45IDAtMTQuMyA2LjQtMTQuMyAxNC4zdjI1Ny4yYzAgNy45IDYuNCAxNC4zIDE0LjMgMTQuM2gyNTcuMWM3LjkgMCAxNC4zLTYuNCAxNC4zLTE0LjNWNTQ0aDg1Ljd2MjIxLjVjMCAzLjkgMy4yIDcuMSA3LjEgNy4xaDEzNS43djkyLjljMCA3LjkgNi40IDE0LjMgMTQuMyAxNC4zaDI1Ny4xYzcuOSAwIDE0LjMtNi40IDE0LjMtMTQuM3YtMjU3YzAtNy45LTYuNC0xNC4zLTE0LjMtMTQuM2gtMjU3Yy03LjkgMC0xNC4zIDYuNC0xNC4zIDE0LjN2MTAwaC03OC42di0zOTNoNzguNnYxMDBjMCA3LjkgNi40IDE0LjMgMTQuMyAxNC4zem01My41LTIxNy45aDE1MFYzNjJoLTE1MFYyMTEuOXpNMzI5LjkgNTg3aC0xNTBWNDM3aDE1MHYxNTB6bTM2NC4yIDc1LjFoMTUwdjE1MC4xaC0xNTBWNjYyLjF6IiAvPjwvc3ZnPg==) */
const RefIcon = /*#__PURE__*/React.forwardRef(PartitionOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'PartitionOutlined';
}
var _default = exports.default = RefIcon;