"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FooterComponents = void 0;
var _context = require("@rc-component/context");
var React = _interopRequireWildcard(require("react"));
var _TableContext = _interopRequireWildcard(require("../context/TableContext"));
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
var _Summary = _interopRequireDefault(require("./Summary"));
var _SummaryContext = _interopRequireDefault(require("./SummaryContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const Footer = props => {
  if (process.env.NODE_ENV !== 'production') {
    (0, _useRenderTimes.default)(props);
  }
  const {
    children,
    stickyOffsets,
    flattenColumns
  } = props;
  const prefixCls = (0, _context.useContext)(_TableContext.default, 'prefixCls');
  const lastColumnIndex = flattenColumns.length - 1;
  const scrollColumn = flattenColumns[lastColumnIndex];
  const summaryContext = React.useMemo(() => ({
    stickyOffsets,
    flattenColumns,
    scrollColumnIndex: scrollColumn?.scrollbar ? lastColumnIndex : null
  }), [scrollColumn, flattenColumns, lastColumnIndex, stickyOffsets]);
  return /*#__PURE__*/React.createElement(_SummaryContext.default.Provider, {
    value: summaryContext
  }, /*#__PURE__*/React.createElement("tfoot", {
    className: `${prefixCls}-summary`
  }, children));
};
var _default = exports.default = (0, _TableContext.responseImmutable)(Footer);
const FooterComponents = exports.FooterComponents = _Summary.default;