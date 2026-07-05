import { useContext } from '@rc-component/context';
import TableContext from "../context/TableContext";
/** Check if cell is in hover range */
function inHoverRange(cellStartRow, cellRowSpan, startRow, endRow) {
  const cellEndRow = cellStartRow + cellRowSpan - 1;
  return cellStartRow <= endRow && cellEndRow >= startRow;
}
export default function useHoverState(rowIndex, rowSpan) {
  return useContext(TableContext, ctx => {
    const hovering = inHoverRange(rowIndex, rowSpan || 1, ctx.hoverStartRow, ctx.hoverEndRow);
    return [hovering, ctx.onHover];
  });
}