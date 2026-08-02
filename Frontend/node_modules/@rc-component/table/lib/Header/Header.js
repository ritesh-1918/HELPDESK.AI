"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _context = require("@rc-component/context");
var _TableContext = _interopRequireWildcard(require("../context/TableContext"));
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
var _HeaderRow = _interopRequireDefault(require("./HeaderRow"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function parseHeaderRows(rootColumns, classNames, styles) {
  const rows = [];
  function fillRowCells(columns, colIndex, rowIndex = 0) {
    // Init rows
    rows[rowIndex] = rows[rowIndex] || [];
    let currentColIndex = colIndex;
    const colSpans = columns.filter(Boolean).map(column => {
      const cell = {
        key: column.key,
        className: (0, _clsx.clsx)(column.className, classNames.cell) || '',
        style: styles.cell,
        children: column.title,
        column,
        colStart: currentColIndex
      };
      let colSpan = 1;
      const subColumns = column.children;
      if (subColumns && subColumns.length > 0) {
        colSpan = fillRowCells(subColumns, currentColIndex, rowIndex + 1).reduce((total, count) => total + count, 0);
        cell.hasSubColumns = true;
      }
      if ('colSpan' in column) {
        ({
          colSpan
        } = column);
      }
      if ('rowSpan' in column) {
        cell.rowSpan = column.rowSpan;
      }
      cell.colSpan = colSpan;
      cell.colEnd = cell.colStart + colSpan - 1;
      rows[rowIndex].push(cell);
      currentColIndex += colSpan;
      return colSpan;
    });
    return colSpans;
  }

  // Generate `rows` cell data
  fillRowCells(rootColumns, 0);

  // Handle `rowSpan`
  const rowCount = rows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach(cell => {
      if (!('rowSpan' in cell) && !cell.hasSubColumns) {
        // eslint-disable-next-line no-param-reassign
        cell.rowSpan = rowCount - rowIndex;
      }
    });
  }
  return rows;
}
const Header = props => {
  if (process.env.NODE_ENV !== 'production') {
    (0, _useRenderTimes.default)(props);
  }
  const {
    stickyOffsets,
    columns,
    flattenColumns,
    onHeaderRow
  } = props;
  const {
    prefixCls,
    getComponent,
    classNames,
    styles
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls', 'getComponent', 'classNames', 'styles']);
  const {
    header: headerCls = {}
  } = classNames || {};
  const {
    header: headerStyles = {}
  } = styles || {};
  const rows = React.useMemo(() => parseHeaderRows(columns, headerCls, headerStyles), [columns, headerCls, headerStyles]);
  const WrapperComponent = getComponent(['header', 'wrapper'], 'thead');
  const trComponent = getComponent(['header', 'row'], 'tr');
  const thComponent = getComponent(['header', 'cell'], 'th');
  return /*#__PURE__*/React.createElement(WrapperComponent, {
    className: (0, _clsx.clsx)(`${prefixCls}-thead`, headerCls.wrapper),
    style: headerStyles.wrapper
  }, rows.map((row, rowIndex) => {
    const rowNode = /*#__PURE__*/React.createElement(_HeaderRow.default, {
      classNames: headerCls,
      styles: headerStyles,
      key: rowIndex,
      flattenColumns: flattenColumns,
      cells: row,
      stickyOffsets: stickyOffsets,
      rowComponent: trComponent,
      cellComponent: thComponent,
      onHeaderRow: onHeaderRow,
      index: rowIndex
    });
    return rowNode;
  }));
};
var _default = exports.default = (0, _TableContext.responseImmutable)(Header);