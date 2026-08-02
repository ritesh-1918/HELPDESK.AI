"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var _clsx = require("clsx");
var _ref = require("@rc-component/util/lib/ref");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _ColGroup = _interopRequireDefault(require("../ColGroup"));
var _TableContext = _interopRequireDefault(require("../context/TableContext"));
var _useRenderTimes = _interopRequireDefault(require("../hooks/useRenderTimes"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useColumnWidth(colWidths, columCount) {
  return (0, _react.useMemo)(() => {
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
    (0, _useRenderTimes.default)(props);
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
  } = (0, _context.useContext)(_TableContext.default, ['prefixCls', 'scrollbarSize', 'isSticky', 'getComponent']);
  const TableComponent = getComponent(['header', 'table'], 'table');
  const combinationScrollBarSize = isSticky && !fixHeader ? 0 : scrollbarSize;

  // Pass wheel to scroll event
  const scrollRef = React.useRef(null);
  const setScrollRef = React.useCallback(element => {
    (0, _ref.fillRef)(ref, element);
    (0, _ref.fillRef)(scrollRef, element);
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
  const columnsWithScrollbar = (0, _react.useMemo)(() => combinationScrollBarSize ? [...columns, ScrollBarColumn] : columns, [combinationScrollBarSize, columns]);
  const flattenColumnsWithScrollbar = (0, _react.useMemo)(() => combinationScrollBarSize ? [...flattenColumns, ScrollBarColumn] : flattenColumns, [combinationScrollBarSize, flattenColumns]);

  // Calculate the sticky offsets
  const headerStickyOffsets = (0, _react.useMemo)(() => {
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
  const isColGroupEmpty = (0, _react.useMemo)(() => {
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
    className: (0, _clsx.clsx)(className, {
      [stickyClassName]: !!stickyClassName
    })
  }, /*#__PURE__*/React.createElement(TableComponent, {
    style: {
      tableLayout,
      minWidth: '100%',
      // https://github.com/ant-design/ant-design/issues/54894
      width: scrollX
    }
  }, isColGroupEmpty ? colGroup : /*#__PURE__*/React.createElement(_ColGroup.default, {
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
var _default = exports.default = /*#__PURE__*/React.memo(FixedHolder);