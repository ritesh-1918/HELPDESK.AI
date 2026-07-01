function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import Cell from "../Cell";
import TableContext from "../context/TableContext";
import { useContext } from '@rc-component/context';
import { getCellFixedInfo } from "../utils/fixUtil";
import { getColumnsKey } from "../utils/valueUtil";
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
  } = useContext(TableContext, ['prefixCls']);
  let rowProps;
  if (onHeaderRow) {
    rowProps = onHeaderRow(cells.map(cell => cell.column), index);
  }
  const columnsKey = getColumnsKey(cells.map(cell => cell.column));
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
    const fixedInfo = getCellFixedInfo(colStart, colEnd, flattenColumns, stickyOffsets);
    const additionalProps = column?.onHeaderCell?.(column) || {};
    return /*#__PURE__*/React.createElement(Cell, _extends({}, cell, {
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
export default HeaderRow;