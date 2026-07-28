"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ProductOutlined = _interopRequireDefault(require("@ant-design/icons-svg/lib/asn/ProductOutlined"));
var _AntdIcon = _interopRequireDefault(require("../components/AntdIcon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY
const ProductOutlined = (props, ref) => /*#__PURE__*/React.createElement(_AntdIcon.default, _extends({}, props, {
  ref: ref,
  icon: _ProductOutlined.default
}));

/**![product](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iNjQgNjQgODk2IDg5NiIgZm9jdXNhYmxlPSJmYWxzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDY0IDE0NGExNiAxNiAwIDAxMTYgMTZ2MzA0YTE2IDE2IDAgMDEtMTYgMTZIMTYwYTE2IDE2IDAgMDEtMTYtMTZWMTYwYTE2IDE2IDAgMDExNi0xNnptLTUyIDY4SDIxMnYyMDBoMjAwem00OTMuMzMgODcuNjlhMTYgMTYgMCAwMTAgMjIuNjJMNzI0LjMxIDUwMy4zM2ExNiAxNiAwIDAxLTIyLjYyIDBMNTIwLjY3IDMyMi4zMWExNiAxNiAwIDAxMC0yMi42MmwxODEuMDItMTgxLjAyYTE2IDE2IDAgMDEyMi42MiAwem0tODQuODUgMTEuM0w3MTMgMjAzLjUzIDYwNS41MiAzMTEgNzEzIDQxOC40OHpNNDY0IDU0NGExNiAxNiAwIDAxMTYgMTZ2MzA0YTE2IDE2IDAgMDEtMTYgMTZIMTYwYTE2IDE2IDAgMDEtMTYtMTZWNTYwYTE2IDE2IDAgMDExNi0xNnptLTUyIDY4SDIxMnYyMDBoMjAwem00NTItNjhhMTYgMTYgMCAwMTE2IDE2djMwNGExNiAxNiAwIDAxLTE2IDE2SDU2MGExNiAxNiAwIDAxLTE2LTE2VjU2MGExNiAxNiAwIDAxMTYtMTZ6bS01MiA2OEg2MTJ2MjAwaDIwMHoiIC8+PC9zdmc+) */
const RefIcon = /*#__PURE__*/React.forwardRef(ProductOutlined);
if (process.env.NODE_ENV !== 'production') {
  RefIcon.displayName = 'ProductOutlined';
}
var _default = exports.default = RefIcon;