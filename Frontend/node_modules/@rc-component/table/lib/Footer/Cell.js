"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Cell = _interopRequireDefault(require("../Cell"));
var _TableContext = _interopRequireDefault(require("../context/TableContext"));
var _context = require("@rc-component/context");
var _fixUtil = require("../utils/fixUtil");
var _SummaryContext = _interopRequireDefault(require("./SummaryContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const SummaryCell = props => {
  const {
    className,
    index,
    children,
    colSpan = 1,
    rowSpan,
    align
  } = props;
  const {
    prefixCls
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls']);
  const {
    scrollColumnIndex,
    stickyOffsets,
    flattenColumns
  } = React.useContext(_SummaryContext.default);
  const lastIndex = index + colSpan - 1;
  const mergedColSpan = lastIndex + 1 === scrollColumnIndex ? colSpan + 1 : colSpan;
  const fixedInfo = React.useMemo(() => (0, _fixUtil.getCellFixedInfo)(index, index + mergedColSpan - 1, flattenColumns, stickyOffsets), [index, mergedColSpan, flattenColumns, stickyOffsets]);
  return /*#__PURE__*/React.createElement(_Cell.default, _extends({
    className: className,
    index: index,
    component: "td",
    prefixCls: prefixCls,
    record: null,
    dataIndex: null,
    align: align,
    colSpan: mergedColSpan,
    rowSpan: rowSpan,
    render: () => children
  }, fixedInfo));
};
var _default = exports.default = SummaryCell;