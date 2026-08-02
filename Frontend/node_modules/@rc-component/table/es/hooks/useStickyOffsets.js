import { useMemo } from 'react';
/**
 * Get sticky column offset width
 */
function useStickyOffsets(colWidths, flattenColumns) {
  const stickyOffsets = useMemo(() => {
    const columnCount = flattenColumns.length;
    const getOffsets = (startIndex, endIndex, offset) => {
      const offsets = [];
      let total = 0;
      for (let i = startIndex; i !== endIndex; i += offset) {
        offsets.push(total);
        if (flattenColumns[i].fixed) {
          total += colWidths[i] || 0;
        }
      }
      return offsets;
    };
    const startOffsets = getOffsets(0, columnCount, 1);
    const endOffsets = getOffsets(columnCount - 1, -1, -1).reverse();
    return {
      start: startOffsets,
      end: endOffsets,
      widths: colWidths
    };
  }, [colWidths, flattenColumns]);
  return stickyOffsets;
}
export default useStickyOffsets;