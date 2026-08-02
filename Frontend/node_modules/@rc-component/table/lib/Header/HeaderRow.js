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
var _valueUtil = require("../utils/valueUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const HeaderRow = props => {
  const {
    cells,
    stickyOffsets,
    flattenColumns,
    rowComponent: RowComponent,
    cellComponent: CellComponent,
    onHeaderRow,
    index,
    classNames,
    styles
  } = props;
  const {
    prefixCls
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls']);
  let rowProps;
  if (onHeaderRow) {
    rowProps = onHeaderRow(cells.map(cell => cell.column), index);
  }
  const columnsKey = (0, _valueUtil.getColumnsKey)(cells.map(cell => cell.column));
  return /*#__PURE__*/React.createElement(RowComponent, _extends({}, rowProps, {
    className: classNames.row,
    style: styles.row
  }), cells.map((cell, cellIndex) => {
    const {
      column,
      colStart,
      colEnd,
      colSpan
    } = cell;
    const fixedInfo = (0, _fixUtil.getCellFixedInfo)(colStart, colEnd, flattenColumns, stickyOffsets);
    const additionalProps = column?.onHeaderCell?.(column) || {};
    return /*#__PURE__*/React.createElement(_Cell.default, _extends({}, cell, {
      scope: column.title ? colSpan > 1 ? 'colgroup' : 'col' : null,
      ellipsis: column.ellipsis,
      align: column.align,
      component: CellComponent,
      prefixCls: prefixCls,
      key: columnsKey[cellIndex]
    }, fixedInfo, {
      additionalProps: additionalProps,
      rowType: "header"
    }));
  }));
};
if (process.env.NODE_ENV !== 'production') {
  HeaderRow.displayName = 'HeaderRow';
}
var _default = exports.default = HeaderRow;