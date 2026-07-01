function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import Cell from "../Cell";
import TableContext from "../context/TableContext";
import { useContext } from '@rc-component/context';
import { getCellFixedInfo } from "../utils/fixUtil";
import SummaryContext from "./SummaryContext";
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
  } = useContext(TableContext, ['prefixCls']);
  const {
    scrollColumnIndex,
    stickyOffsets,
    flattenColumns
  } = React.useContext(SummaryContext);
  const lastIndex = index + colSpan - 1;
  const mergedColSpan = lastIndex + 1 === scrollColumnIndex ? colSpan + 1 : colSpan;
  const fixedInfo = React.useMemo(() => getCellFixedInfo(index, index + mergedColSpan - 1, flattenColumns, stickyOffsets), [index, mergedColSpan, flattenColumns, stickyOffsets]);
  return /*#__PURE__*/React.createElement(Cell, _extends({
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
export default SummaryCell;