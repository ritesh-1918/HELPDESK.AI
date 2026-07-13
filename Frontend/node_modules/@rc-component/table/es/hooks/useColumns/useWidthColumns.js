import * as React from 'react';
function parseColWidth(totalWidth, width = '') {
  if (typeof width === 'number') {
    return width;
  }
  if (width.endsWith('%')) {
    return totalWidth * parseFloat(width) / 100;
  }
  return null;
}

/**
 * Fill all column with width
 */
export default function useWidthColumns(flattenColumns, scrollWidth, clientWidth) {
  return React.useMemo(() => {
    // Fill width if needed
    if (scrollWidth && scrollWidth > 0) {
      let totalWidth = 0;
      let missWidthCount = 0;

      // collect not given width column
      flattenColumns.forEach(col => {
        const colWidth = parseColWidth(scrollWidth, col.width);
        if (colWidth) {
          totalWidth += colWidth;
        } else {
          missWidthCount += 1;
        }
      });

      // Fill width
      const maxFitWidth = Math.max(scrollWidth, clientWidth);
      let restWidth = Math.max(maxFitWidth - totalWidth, missWidthCount);
      let restCount = missWidthCount;
      const avgWidth = restWidth / missWidthCount;
      let realTotal = 0;
      const filledColumns = flattenColumns.map(col => {
        const clone = {
          ...col
        };
        const colWidth = parseColWidth(scrollWidth, clone.width);
        if (colWidth) {
          clone.width = colWidth;
        } else {
          const colAvgWidth = Math.floor(avgWidth);
          clone.width = restCount === 1 ? restWidth : colAvgWidth;
          restWidth -= colAvgWidth;
          restCount -= 1;
        }
        realTotal += clone.width;
        return clone;
      });

      // If realTotal is less than clientWidth,
      // We need extend column width
      if (realTotal < maxFitWidth) {
        const scale = maxFitWidth / realTotal;
        restWidth = maxFitWidth;
        filledColumns.forEach((col, index) => {
          const colWidth = Math.floor(col.width * scale);
          col.width = index === filledColumns.length - 1 ? restWidth : colWidth;
          restWidth -= colWidth;
        });
      }
      return [filledColumns, Math.max(realTotal, maxFitWidth)];
    }
    return [flattenColumns, scrollWidth];
  }, [flattenColumns, scrollWidth, clientWidth]);
}