"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useWidthColumns;
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
function useWidthColumns(flattenColumns, scrollWidth, clientWidth) {
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