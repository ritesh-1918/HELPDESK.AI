"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCellFixedInfo = getCellFixedInfo;
function isFixedStart(column) {
  return column.fixed === 'start';
}
function isFixedEnd(column) {
  return column.fixed === 'end';
}
function getCellFixedInfo(colStart, colEnd, columns, stickyOffsets) {
  const startColumn = columns[colStart] || {};
  const endColumn = columns[colEnd] || {};
  let fixStart = null;
  let fixEnd = null;
  if (isFixedStart(startColumn) && isFixedStart(endColumn)) {
    fixStart = stickyOffsets.start[colStart];
  } else if (isFixedEnd(endColumn) && isFixedEnd(startColumn)) {
    fixEnd = stickyOffsets.end[colEnd];
  }

  // check if need to add shadow
  let fixedStartShadow = false;
  let fixedEndShadow = false;

  // Calc `zIndex`.
  // first fixed start (start -> end) column `zIndex` should be greater than next column.
  // first fixed end (end -> start) column `zIndex` should be greater than next column.
  let zIndex = 0;
  let zIndexReverse = 0;
  if (fixStart !== null) {
    fixedStartShadow = !columns[colEnd + 1] || !isFixedStart(columns[colEnd + 1]);
    zIndex = columns.length * 2 - colStart; // Fix start always overlay fix end
    zIndexReverse = columns.length + colStart;
  }
  if (fixEnd !== null) {
    fixedEndShadow = !columns[colStart - 1] || !isFixedEnd(columns[colStart - 1]);
    zIndex = colEnd;
    zIndexReverse = columns.length - colEnd; // Fix end always overlay fix start
  }

  // Check if scrollLeft will show the shadow
  let offsetFixedStartShadow = 0;
  let offsetFixedEndShadow = 0;
  if (fixedStartShadow) {
    for (let i = 0; i < colStart; i += 1) {
      if (!isFixedStart(columns[i])) {
        offsetFixedStartShadow += stickyOffsets.widths[i] || 0;
      }
    }
  }
  if (fixedEndShadow) {
    for (let i = columns.length - 1; i > colEnd; i -= 1) {
      if (!isFixedEnd(columns[i])) {
        offsetFixedEndShadow += stickyOffsets.widths[i] || 0;
      }
    }
  }
  return {
    fixStart,
    fixEnd,
    fixedStartShadow,
    fixedEndShadow,
    offsetFixedStartShadow,
    offsetFixedEndShadow,
    isSticky: stickyOffsets.isSticky,
    zIndex,
    zIndexReverse
  };
}