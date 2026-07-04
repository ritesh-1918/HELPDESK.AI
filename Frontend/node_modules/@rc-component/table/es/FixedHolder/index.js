import { useContext } from '@rc-component/context';
import { clsx } from 'clsx';
import { fillRef } from "@rc-component/util/es/ref";
import * as React from 'react';
import { useMemo } from 'react';
import ColGroup from "../ColGroup";
import TableContext from "../context/TableContext";
import devRenderTimes from "../hooks/useRenderTimes";
function useColumnWidth(colWidths, columCount) {
  return useMemo(() => {
    const cloneColumns = [];
    for (let i = 0; i < columCount; i += 1) {
      const val = colWidths[i];
      if (val !== undefined) {
        cloneColumns[i] = val;
      } else {
        return null;
      }
    }
    return cloneColumns;
  }, [colWidths.join('_'), columCount]);
}
const FixedHolder = /*#__PURE__*/React.forwardRef((props, ref) => {
  if (process.env.NODE_ENV !== 'production') {
    devRenderTimes(props);
  }
  const {
    className,
    style,
    noData,
    columns,
    flattenColumns,
    colWidths,
    colGroup,
    columCount,
    stickyOffsets,
    direction,
    fixHeader,
    stickyTopOffset,
    stickyBottomOffset,
    stickyClassName,
    scrollX,
    tableLayout = 'fixed',
    onScroll,
    maxContentScroll,
    children,
    ...restProps
  } = props;
  const {
    prefixCls,
    scrollbarSize,
    isSticky,
    getComponent
  } = useContext(TableContext, ['prefixCls', 'scrollbarSize', 'isSticky', 'getComponent']);
  const TableComponent = getComponent(['header', 'table'], 'table');
  const combinationScrollBarSize = isSticky && !fixHeader ? 0 : scrollbarSize;

  // Pass wheel to scroll event
  const scrollRef = React.useRef(null);
  const setScrollRef = React.useCallback(element => {
    fillRef(ref, element);
    fillRef(scrollRef, element);
  }, []);
  React.useEffect(() => {
    function onWheel(e) {
      const {
        currentTarget,
        deltaX
      } = e;
      if (deltaX) {
        const {
          scrollLeft,
          scrollWidth,
          clientWidth
        } = currentTarget;
        const maxScrollWidth = scrollWidth - clientWidth;
        let nextScroll = scrollLeft + deltaX;
        if (direction === 'rtl') {
          nextScroll = Math.max(-maxScrollWidth, nextScroll);
          nextScroll = Math.min(0, nextScroll);
        } else {
          nextScroll = Math.min(maxScrollWidth, nextScroll);
          nextScroll = Math.max(0, nextScroll);
        }
        onScroll({
          currentTarget,
          scrollLeft: nextScroll
        });
        e.preventDefault();
      }
    }
    const scrollEle = scrollRef.current;
    scrollEle?.addEventListener('wheel', onWheel, {
      passive: false
    });
    return () => {
      scrollEle?.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Add scrollbar column
  const lastColumn = flattenColumns[flattenColumns.length - 1];
  const ScrollBarColumn = {
    fixed: lastColumn ? lastColumn.fixed : null,
    scrollbar: true,
    onHeaderCell: () => ({
      className: `${prefixCls}-cell-scrollbar`
    })
  };
  const columnsWithScrollbar = useMemo(() => combinationScrollBarSize ? [...columns, ScrollBarColumn] : columns, [combinationScrollBarSize, columns]);
  const flattenColumnsWithScrollbar = useMemo(() => combinationScrollBarSize ? [...flattenColumns, ScrollBarColumn] : flattenColumns, [combinationScrollBarSize, flattenColumns]);

  // Calculate the sticky offsets
  const headerStickyOffsets = useMemo(() => {
    const {
      start,
      end
    } = stickyOffsets;
    return {
      ...stickyOffsets,
      // left:
      //   direction === 'rtl' ? [...left.map(width => width + combinationScrollBarSize), 0] : left,
      // right:
      //   direction === 'rtl' ? right : [...right.map(width => width + combinationScrollBarSize), 0],
      start: start,
      end: [...end.map(width => width + combinationScrollBarSize), 0],
      isSticky
    };
  }, [combinationScrollBarSize, stickyOffsets, isSticky]);
  const mergedColumnWidth = useColumnWidth(colWidths, columCount);
  const isColGroupEmpty = useMemo(() => {
    // use original ColGroup if no data or no calculated column width, otherwise use calculated column width
    // Return original colGroup if no data, or mergedColumnWidth is empty, or all widths are falsy
    const noWidth = !mergedColumnWidth || !mergedColumnWidth.length || mergedColumnWidth.every(w => !w);
    return noData || noWidth;
  }, [noData, mergedColumnWidth]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      ...(isSticky ? {
        top: stickyTopOffset,
        bottom: stickyBottomOffset
      } : {}),
      ...style
    },
    ref: setScrollRef,
    className: clsx(className, {
      [stickyClassName]: !!stickyClassName
    })
  }, /*#__PURE__*/React.createElement(TableComponent, {
    style: {
      tableLayout,
      minWidth: '100%',
      // https://github.com/ant-design/ant-design/issues/54894
      width: scrollX
    }
  }, isColGroupEmpty ? colGroup : /*#__PURE__*/React.createElement(ColGroup, {
    colWidths: [...mergedColumnWidth, combinationScrollBarSize],
    columCount: columCount + 1,
    columns: flattenColumnsWithScrollbar
  }), children({
    ...restProps,
    stickyOffsets: headerStickyOffsets,
    columns: columnsWithScrollbar,
    flattenColumns: flattenColumnsWithScrollbar
  })));
});
if (process.env.NODE_ENV !== 'production') {
  FixedHolder.displayName = 'FixedHolder';
}

/** Return a table in div as fixed element which contains sticky info */
// export default responseImmutable(FixedHolder);
export default /*#__PURE__*/React.memo(FixedHolder);