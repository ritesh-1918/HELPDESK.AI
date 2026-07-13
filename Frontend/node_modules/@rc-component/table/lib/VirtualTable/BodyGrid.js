"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var _virtualList = _interopRequireDefault(require("@rc-component/virtual-list"));
var React = _interopRequireWildcard(require("react"));
var _TableContext = _interopRequireWildcard(require("../context/TableContext"));
var _useFlattenRecords = _interopRequireDefault(require("../hooks/useFlattenRecords"));
var _BodyLine = _interopRequireDefault(require("./BodyLine"));
var _context2 = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Grid = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    data,
    onScroll
  } = props;
  const {
    flattenColumns,
    onColumnResize,
    getRowKey,
    expandedKeys,
    prefixCls,
    childrenColumnName,
    scrollX,
    direction
  } = (0, _context.useContext)(_TableContext.default, ['flattenColumns', 'onColumnResize', 'getRowKey', 'prefixCls', 'expandedKeys', 'childrenColumnName', 'scrollX', 'direction']);
  const {
    sticky,
    scrollY,
    listItemHeight,
    getComponent,
    onScroll: onTablePropScroll
  } = (0, _context.useContext)(_context2.StaticContext);

  // =========================== Ref ============================
  const listRef = React.useRef(null);

  // =========================== Data ===========================
  const flattenData = (0, _useFlattenRecords.default)(data, childrenColumnName, expandedKeys, getRowKey);

  // ========================== Column ==========================
  const columnsWidth = React.useMemo(() => {
    let total = 0;
    return flattenColumns.map(({
      width,
      minWidth,
      key
    }) => {
      const finalWidth = Math.max(width || 0, minWidth || 0);
      total += finalWidth;
      return [key, finalWidth, total];
    });
  }, [flattenColumns]);
  const columnsOffset = React.useMemo(() => columnsWidth.map(colWidth => colWidth[2]), [columnsWidth]);
  React.useEffect(() => {
    columnsWidth.forEach(([key, width]) => {
      onColumnResize(key, width);
    });
  }, [columnsWidth]);

  // =========================== Ref ============================
  React.useImperativeHandle(ref, () => {
    const obj = {
      scrollTo: config => {
        const {
          offset,
          ...restConfig
        } = config;

        // If offset is provided, force align to 'top' for consistent behavior
        if (offset) {
          listRef.current?.scrollTo({
            ...restConfig,
            offset,
            align: 'top'
          });
        } else {
          listRef.current?.scrollTo(config);
        }
      },
      nativeElement: listRef.current?.nativeElement
    };
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => listRef.current?.getScrollInfo().x || 0,
      set: value => {
        listRef.current?.scrollTo({
          left: value
        });
      }
    });

    // https://github.com/ant-design/ant-design/issues/54734
    Object.defineProperty(obj, 'scrollTop', {
      get: () => listRef.current?.getScrollInfo().y || 0,
      set: value => {
        listRef.current?.scrollTo({
          top: value
        });
      }
    });
    return obj;
  });

  // ======================= Col/Row Span =======================
  const getRowSpan = (column, index) => {
    const record = flattenData[index]?.record;
    const {
      onCell
    } = column;
    if (onCell) {
      const cellProps = onCell(record, index);
      return cellProps?.rowSpan ?? 1;
    }
    return 1;
  };
  const extraRender = info => {
    const {
      start,
      end,
      getSize,
      offsetY
    } = info;

    // Do nothing if no data
    if (end < 0) {
      return null;
    }

    // Find first rowSpan column
    let firstRowSpanColumns = flattenColumns.filter(
    // rowSpan is 0
    column => getRowSpan(column, start) === 0);
    let startIndex = start;
    for (let i = start; i >= 0; i -= 1) {
      firstRowSpanColumns = firstRowSpanColumns.filter(column => getRowSpan(column, i) === 0);
      if (!firstRowSpanColumns.length) {
        startIndex = i;
        break;
      }
    }

    // Find last rowSpan column
    let lastRowSpanColumns = flattenColumns.filter(
    // rowSpan is not 1
    column => getRowSpan(column, end) !== 1);
    let endIndex = end;
    for (let i = end; i < flattenData.length; i += 1) {
      lastRowSpanColumns = lastRowSpanColumns.filter(column => getRowSpan(column, i) !== 1);
      if (!lastRowSpanColumns.length) {
        endIndex = Math.max(i - 1, end);
        break;
      }
    }

    // Collect the line who has rowSpan
    const spanLines = [];
    for (let i = startIndex; i <= endIndex; i += 1) {
      const item = flattenData[i];

      // This code will never reach, just incase
      if (!item) {
        continue;
      }
      if (flattenColumns.some(column => getRowSpan(column, i) > 1)) {
        spanLines.push(i);
      }
    }

    // Patch extra line on the page
    const nodes = spanLines.map(index => {
      const item = flattenData[index];
      const rowKey = getRowKey(item.record, index);
      const getHeight = rowSpan => {
        const endItemIndex = index + rowSpan - 1;
        const endItem = flattenData[endItemIndex];
        if (!endItem || !endItem.record) {
          // clamp 到当前可用的最后一行，或退化为默认高度
          const safeEndIndex = Math.min(endItemIndex, flattenData.length - 1);
          const safeEndItem = flattenData[safeEndIndex];
          const endItemKey = getRowKey(safeEndItem.record, safeEndIndex);
          const sizeInfo = getSize(rowKey, endItemKey);
          return sizeInfo.bottom - sizeInfo.top;
        }
        const endItemKey = getRowKey(endItem.record, endItemIndex);
        const sizeInfo = getSize(rowKey, endItemKey);
        return sizeInfo.bottom - sizeInfo.top;
      };
      const sizeInfo = getSize(rowKey);
      return /*#__PURE__*/React.createElement(_BodyLine.default, {
        key: index,
        data: item,
        rowKey: rowKey,
        index: index,
        style: {
          top: -offsetY + sizeInfo.top
        },
        extra: true,
        getHeight: getHeight
      });
    });
    return nodes;
  };

  // ========================= Context ==========================
  const gridContext = React.useMemo(() => ({
    columnsOffset
  }), [columnsOffset]);

  // ========================== Render ==========================
  const tblPrefixCls = `${prefixCls}-tbody`;

  // default 'div' in @rc-component/virtual-list
  const wrapperComponent = getComponent(['body', 'wrapper']);

  // ========================== Sticky Scroll Bar ==========================
  const horizontalScrollBarStyle = {};
  if (sticky) {
    horizontalScrollBarStyle.position = 'sticky';
    horizontalScrollBarStyle.bottom = 0;
    if (typeof sticky === 'object' && sticky.offsetScroll) {
      horizontalScrollBarStyle.bottom = sticky.offsetScroll;
    }
  }
  return /*#__PURE__*/React.createElement(_context2.GridContext.Provider, {
    value: gridContext
  }, /*#__PURE__*/React.createElement(_virtualList.default, {
    fullHeight: false,
    ref: listRef,
    prefixCls: `${tblPrefixCls}-virtual`,
    styles: {
      horizontalScrollBar: horizontalScrollBarStyle
    },
    className: tblPrefixCls,
    height: scrollY,
    itemHeight: listItemHeight || 24,
    data: flattenData,
    itemKey: item => getRowKey(item.record),
    component: wrapperComponent,
    scrollWidth: scrollX,
    direction: direction,
    onVirtualScroll: ({
      x
    }) => {
      onScroll({
        currentTarget: listRef.current?.nativeElement,
        scrollLeft: x
      });
    },
    onScroll: onTablePropScroll,
    extraRender: extraRender
  }, (item, index, itemProps) => {
    const rowKey = getRowKey(item.record, index);
    return /*#__PURE__*/React.createElement(_BodyLine.default, {
      data: item,
      rowKey: rowKey,
      index: index,
      style: itemProps.style
    });
  }));
});
const ResponseGrid = (0, _TableContext.responseImmutable)(Grid);
if (process.env.NODE_ENV !== 'production') {
  ResponseGrid.displayName = 'ResponseGrid';
}
var _default = exports.default = ResponseGrid;