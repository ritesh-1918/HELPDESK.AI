"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genTable = exports.default = exports.DEFAULT_PREFIX = void 0;
var _clsx = require("clsx");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _getScrollBarSize = require("@rc-component/util/lib/getScrollBarSize");
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _get = _interopRequireDefault(require("@rc-component/util/lib/utils/get"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _Body = _interopRequireDefault(require("./Body"));
var _ColGroup = _interopRequireDefault(require("./ColGroup"));
var _constant = require("./constant");
var _TableContext = _interopRequireWildcard(require("./context/TableContext"));
var _FixedHolder = _interopRequireDefault(require("./FixedHolder"));
var _Footer = _interopRequireWildcard(require("./Footer"));
var _Summary = _interopRequireDefault(require("./Footer/Summary"));
var _Header = _interopRequireDefault(require("./Header/Header"));
var _useColumns = _interopRequireDefault(require("./hooks/useColumns"));
var _useExpand = _interopRequireDefault(require("./hooks/useExpand"));
var _useFixedInfo = _interopRequireDefault(require("./hooks/useFixedInfo"));
var _useFrame = require("./hooks/useFrame");
var _useHover = _interopRequireDefault(require("./hooks/useHover"));
var _useSticky = _interopRequireDefault(require("./hooks/useSticky"));
var _useStickyOffsets = _interopRequireDefault(require("./hooks/useStickyOffsets"));
var _Panel = _interopRequireDefault(require("./Panel"));
var _stickyScrollBar = _interopRequireDefault(require("./stickyScrollBar"));
var _Column = _interopRequireDefault(require("./sugar/Column"));
var _ColumnGroup = _interopRequireDefault(require("./sugar/ColumnGroup"));
var _valueUtil = require("./utils/valueUtil");
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } /**
 * Feature:
 *  - fixed not need to set width
 *  - support `rowExpandable` to config row expand logic
 *  - add `summary` to support `() => ReactNode`
 *
 * Update:
 *  - `dataIndex` is `array[]` now
 *  - `expandable` wrap all the expand related props
 *
 * Removed:
 *  - expandIconAsCell
 *  - useFixedHeader
 *  - rowRef
 *  - columns[number].onCellClick
 *  - onRowClick
 *  - onRowDoubleClick
 *  - onRowMouseEnter
 *  - onRowMouseLeave
 *  - getBodyWrapper
 *  - bodyStyle
 *
 * Deprecated:
 *  - All expanded props, move into expandable
 */
const DEFAULT_PREFIX = exports.DEFAULT_PREFIX = 'rc-table';

// Used for conditions cache
const EMPTY_DATA = [];

// Used for customize scroll
const EMPTY_SCROLL_TARGET = {};
function defaultEmpty() {
  return 'No Data';
}
const Table = (tableProps, ref) => {
  const props = {
    rowKey: 'key',
    prefixCls: DEFAULT_PREFIX,
    emptyText: defaultEmpty,
    ...tableProps
  };
  const {
    prefixCls,
    className,
    rowClassName,
    style,
    classNames,
    styles,
    data,
    rowKey,
    scroll,
    tableLayout,
    direction,
    // Additional Part
    title,
    footer,
    summary,
    caption,
    // Customize
    id,
    showHeader,
    components,
    emptyText,
    onRow,
    onHeaderRow,
    // Measure Row
    measureRowRender,
    // Events
    onScroll,
    // Internal
    internalHooks,
    transformColumns,
    internalRefs,
    tailor,
    getContainerWidth,
    sticky,
    rowHoverable = true
  } = props;
  const mergedData = data || EMPTY_DATA;
  const hasData = !!mergedData.length;
  const useInternalHooks = internalHooks === _constant.INTERNAL_HOOKS;

  // ===================== Warning ======================
  if (process.env.NODE_ENV !== 'production') {
    ['onRowClick', 'onRowDoubleClick', 'onRowContextMenu', 'onRowMouseEnter', 'onRowMouseLeave'].forEach(name => {
      (0, _warning.default)(props[name] === undefined, `\`${name}\` is removed, please use \`onRow\` instead.`);
    });
    (0, _warning.default)(!('getBodyWrapper' in props), '`getBodyWrapper` is deprecated, please use custom `components` instead.');
  }

  // ==================== Customize =====================
  const getComponent = React.useCallback((path, defaultComponent) => (0, _get.default)(components, path) || defaultComponent, [components]);
  const getRowKey = React.useMemo(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return record => {
      const key = record && record[rowKey];
      if (process.env.NODE_ENV !== 'production') {
        (0, _warning.default)(key !== undefined, 'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.');
      }
      return key;
    };
  }, [rowKey]);
  const customizeScrollBody = getComponent(['body']);

  // ====================== Hover =======================
  const [startRow, endRow, onHover] = (0, _useHover.default)();

  // ====================== Expand ======================
  const [expandableConfig, expandableType, mergedExpandedKeys, mergedExpandIcon, mergedChildrenColumnName, onTriggerExpand] = (0, _useExpand.default)(props, mergedData, getRowKey);

  // ====================== Column ======================
  const scrollX = scroll?.x;
  const [componentWidth, setComponentWidth] = React.useState(0);
  const [columns, flattenColumns, flattenScrollX] = (0, _useColumns.default)({
    ...props,
    ...expandableConfig,
    expandable: !!expandableConfig.expandedRowRender,
    columnTitle: expandableConfig.columnTitle,
    expandedKeys: mergedExpandedKeys,
    getRowKey,
    // https://github.com/ant-design/ant-design/issues/23894
    onTriggerExpand,
    expandIcon: mergedExpandIcon,
    expandIconColumnIndex: expandableConfig.expandIconColumnIndex,
    direction,
    scrollWidth: useInternalHooks && tailor && typeof scrollX === 'number' ? scrollX : null,
    clientWidth: componentWidth
  }, useInternalHooks ? transformColumns : null);
  const mergedScrollX = flattenScrollX ?? scrollX;
  const columnContext = React.useMemo(() => ({
    columns,
    flattenColumns
  }), [columns, flattenColumns]);

  // ======================= Refs =======================
  const fullTableRef = React.useRef(null);
  const scrollHeaderRef = React.useRef(null);
  const scrollBodyRef = React.useRef(null);
  const scrollBodyContainerRef = React.useRef(null);
  React.useImperativeHandle(ref, () => {
    return {
      nativeElement: fullTableRef.current,
      scrollTo: config => {
        if (scrollBodyRef.current instanceof HTMLElement) {
          // Native scroll
          const {
            index,
            top,
            key,
            offset
          } = config;
          if ((0, _valueUtil.validNumberValue)(top)) {
            // In top mode, offset is ignored
            scrollBodyRef.current?.scrollTo({
              top
            });
          } else {
            const mergedKey = key ?? getRowKey(mergedData[index]);
            const targetElement = scrollBodyRef.current.querySelector(`[data-row-key="${mergedKey}"]`);
            if (targetElement) {
              if (!offset) {
                // No offset, use scrollIntoView for default behavior
                targetElement.scrollIntoView();
              } else {
                // With offset, use element's offsetTop + offset
                const elementTop = targetElement.offsetTop;
                scrollBodyRef.current.scrollTo({
                  top: elementTop + offset
                });
              }
            }
          }
        } else if (scrollBodyRef.current?.scrollTo) {
          // Pass to proxy
          scrollBodyRef.current.scrollTo(config);
        }
      }
    };
  });

  // ====================== Scroll ======================
  const scrollSummaryRef = React.useRef(null);
  const [shadowStart, setShadowStart] = React.useState(false);
  const [shadowEnd, setShadowEnd] = React.useState(false);
  const [colsWidths, updateColsWidths] = React.useState(new Map());

  // Convert map to number width
  const colsKeys = (0, _valueUtil.getColumnsKey)(flattenColumns);
  const pureColWidths = colsKeys.map(columnKey => colsWidths.get(columnKey));
  const colWidths = React.useMemo(() => pureColWidths, [pureColWidths.join('_')]);
  const stickyOffsets = (0, _useStickyOffsets.default)(colWidths, flattenColumns);
  const fixHeader = scroll && (0, _valueUtil.validateValue)(scroll.y);
  const horizonScroll = scroll && (0, _valueUtil.validateValue)(mergedScrollX) || Boolean(expandableConfig.fixed);
  const fixColumn = horizonScroll && flattenColumns.some(({
    fixed
  }) => fixed);

  // Sticky
  const stickyRef = React.useRef(null);
  const {
    isSticky,
    offsetHeader,
    offsetSummary,
    offsetScroll,
    stickyClassName,
    container
  } = (0, _useSticky.default)(sticky, prefixCls);

  // Footer (Fix footer must fixed header)
  const summaryNode = React.useMemo(() => summary?.(mergedData), [summary, mergedData]);
  const fixFooter = (fixHeader || isSticky) && /*#__PURE__*/React.isValidElement(summaryNode) && summaryNode.type === _Summary.default && summaryNode.props.fixed;

  // Scroll
  let scrollXStyle;
  let scrollYStyle;
  let scrollTableStyle;
  if (fixHeader) {
    scrollYStyle = {
      overflowY: hasData ? 'scroll' : 'auto',
      maxHeight: scroll.y
    };
  }
  if (horizonScroll) {
    scrollXStyle = {
      overflowX: 'auto'
    };
    // When no vertical scrollbar, should hide it
    // https://github.com/ant-design/ant-design/pull/20705
    // https://github.com/ant-design/ant-design/issues/21879
    if (!fixHeader) {
      scrollYStyle = {
        overflowY: 'hidden'
      };
    }
    scrollTableStyle = {
      width: mergedScrollX === true ? 'auto' : mergedScrollX,
      minWidth: '100%'
    };
  }
  const onColumnResize = React.useCallback((columnKey, width) => {
    updateColsWidths(widths => {
      if (widths.get(columnKey) !== width) {
        const newWidths = new Map(widths);
        newWidths.set(columnKey, width);
        return newWidths;
      }
      return widths;
    });
  }, []);
  const [setScrollTarget, getScrollTarget] = (0, _useFrame.useTimeoutLock)(null);
  function forceScroll(scrollLeft, target) {
    if (!target) {
      return;
    }
    if (typeof target === 'function') {
      target(scrollLeft);
    } else if (target.scrollLeft !== scrollLeft) {
      target.scrollLeft = scrollLeft;

      // Delay to force scroll position if not sync
      // ref: https://github.com/ant-design/ant-design/issues/37179
      if (target.scrollLeft !== scrollLeft) {
        setTimeout(() => {
          target.scrollLeft = scrollLeft;
        }, 0);
      }
    }
  }
  const [scrollInfo, setScrollInfo] = React.useState([0, 0]);
  const onInternalScroll = (0, _useEvent.default)(({
    currentTarget,
    scrollLeft
  }) => {
    const mergedScrollLeft = typeof scrollLeft === 'number' ? scrollLeft : currentTarget.scrollLeft;
    const compareTarget = currentTarget || EMPTY_SCROLL_TARGET;
    if (!getScrollTarget() || getScrollTarget() === compareTarget) {
      setScrollTarget(compareTarget);
      forceScroll(mergedScrollLeft, scrollHeaderRef.current);
      forceScroll(mergedScrollLeft, scrollBodyRef.current);
      forceScroll(mergedScrollLeft, scrollSummaryRef.current);
      forceScroll(mergedScrollLeft, stickyRef.current?.setScrollLeft);
    }
    const measureTarget = currentTarget || scrollHeaderRef.current;
    if (measureTarget) {
      const scrollWidth =
      // Should use mergedScrollX in virtual table(useInternalHooks && tailor === true)
      useInternalHooks && tailor && typeof mergedScrollX === 'number' ? mergedScrollX : measureTarget.scrollWidth;
      const clientWidth = measureTarget.clientWidth;
      const absScrollStart = Math.abs(mergedScrollLeft);
      setScrollInfo(ori => {
        const nextScrollInfo = [absScrollStart, scrollWidth - clientWidth];
        return (0, _isEqual.default)(ori, nextScrollInfo) ? ori : nextScrollInfo;
      });

      // There is no space to scroll
      if (scrollWidth === clientWidth) {
        setShadowStart(false);
        setShadowEnd(false);
        return;
      }
      setShadowStart(absScrollStart > 0);
      setShadowEnd(absScrollStart < scrollWidth - clientWidth - 1);
    }
  });
  const onBodyScroll = (0, _useEvent.default)(e => {
    onInternalScroll(e);
    onScroll?.(e);
  });
  const triggerOnScroll = () => {
    if (horizonScroll && scrollBodyRef.current) {
      onInternalScroll({
        currentTarget: (0, _findDOMNode.getDOM)(scrollBodyRef.current),
        scrollLeft: scrollBodyRef.current?.scrollLeft
      });
    } else {
      setShadowStart(false);
      setShadowEnd(false);
    }
  };
  const onFullTableResize = offsetWidth => {
    stickyRef.current?.checkScrollBarVisible();
    let mergedWidth = offsetWidth ?? fullTableRef.current?.offsetWidth ?? 0;
    if (useInternalHooks && getContainerWidth && fullTableRef.current) {
      mergedWidth = getContainerWidth(fullTableRef.current, mergedWidth) || mergedWidth;
    }
    if (mergedWidth !== componentWidth) {
      triggerOnScroll();
      setComponentWidth(mergedWidth);
    }
  };

  // fix https://github.com/ant-design/ant-design/issues/49279
  (0, _useLayoutEffect.default)(() => {
    if (horizonScroll) {
      onFullTableResize();
    }
  }, [horizonScroll]);

  // Sync scroll bar when init or `horizonScroll`, `data` and `columns.length` changed
  const mounted = React.useRef(false);
  React.useEffect(() => {
    // onFullTableResize will be trigger once when ResizeObserver is mounted
    // This will reduce one duplicated triggerOnScroll time
    if (mounted.current) {
      triggerOnScroll();
    }
  }, [horizonScroll, data, columns.length]);
  React.useEffect(() => {
    mounted.current = true;
  }, []);

  // ===================== Effects ======================
  const [scrollbarSize, setScrollbarSize] = React.useState(0);
  (0, _useLayoutEffect.default)(() => {
    if (!tailor || !useInternalHooks) {
      if (scrollBodyRef.current instanceof Element) {
        setScrollbarSize((0, _getScrollBarSize.getTargetScrollBarSize)(scrollBodyRef.current).width);
      } else {
        setScrollbarSize((0, _getScrollBarSize.getTargetScrollBarSize)(scrollBodyContainerRef.current).width);
      }
    }
  }, []);

  // ================== INTERNAL HOOKS ==================
  React.useEffect(() => {
    if (useInternalHooks && internalRefs) {
      internalRefs.body.current = scrollBodyRef.current;
    }
  });

  // ========================================================================
  // ==                               Render                               ==
  // ========================================================================
  // =================== Render: Func ===================
  const renderFixedHeaderTable = React.useCallback(fixedHolderPassProps => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_Header.default, fixedHolderPassProps), fixFooter === 'top' && /*#__PURE__*/React.createElement(_Footer.default, fixedHolderPassProps, summaryNode)), [fixFooter, summaryNode]);
  const renderFixedFooterTable = React.useCallback(fixedHolderPassProps => /*#__PURE__*/React.createElement(_Footer.default, fixedHolderPassProps, summaryNode), [summaryNode]);

  // =================== Render: Node ===================
  const TableComponent = getComponent(['table'], 'table');

  // Table layout
  const mergedTableLayout = React.useMemo(() => {
    if (tableLayout) {
      return tableLayout;
    }
    // https://github.com/ant-design/ant-design/issues/25227
    // When scroll.x is max-content, no need to fix table layout
    // it's width should stretch out to fit content
    if (fixColumn) {
      return mergedScrollX === 'max-content' ? 'auto' : 'fixed';
    }
    if (fixHeader || isSticky || flattenColumns.some(({
      ellipsis
    }) => ellipsis)) {
      return 'fixed';
    }
    return 'auto';
  }, [fixHeader, fixColumn, flattenColumns, tableLayout, isSticky]);
  let groupTableNode;

  // Header props
  const headerProps = {
    colWidths,
    columCount: flattenColumns.length,
    stickyOffsets,
    onHeaderRow,
    fixHeader,
    scroll
  };

  // Empty
  const emptyNode = React.useMemo(() => {
    if (hasData) {
      return null;
    }
    if (typeof emptyText === 'function') {
      return emptyText();
    }
    return emptyText;
  }, [hasData, emptyText]);

  // Body
  const bodyTable = /*#__PURE__*/React.createElement(_Body.default, {
    data: mergedData,
    measureColumnWidth: fixHeader || horizonScroll || isSticky
  });
  const bodyColGroup = /*#__PURE__*/React.createElement(_ColGroup.default, {
    colWidths: flattenColumns.map(({
      width
    }) => width),
    columns: flattenColumns
  });
  const captionElement = caption !== null && caption !== undefined ? /*#__PURE__*/React.createElement("caption", {
    className: `${prefixCls}-caption`
  }, caption) : undefined;
  const dataProps = (0, _pickAttrs.default)(props, {
    data: true
  });
  const ariaProps = (0, _pickAttrs.default)(props, {
    aria: true
  });
  if (fixHeader || isSticky) {
    // >>>>>> Fixed Header
    let bodyContent;
    if (typeof customizeScrollBody === 'function') {
      bodyContent = customizeScrollBody(mergedData, {
        scrollbarSize,
        ref: scrollBodyRef,
        onScroll: onInternalScroll
      });
      headerProps.colWidths = flattenColumns.map(({
        width
      }, index) => {
        const colWidth = index === flattenColumns.length - 1 ? width - scrollbarSize : width;
        if (typeof colWidth === 'number' && !Number.isNaN(colWidth)) {
          return colWidth;
        }
        if (process.env.NODE_ENV !== 'production') {
          (0, _warning.default)(props.columns.length === 0, 'When use `components.body` with render props. Each column should have a fixed `width` value.');
        }
        return 0;
      });
    } else {
      bodyContent = /*#__PURE__*/React.createElement("div", {
        style: {
          ...scrollXStyle,
          ...scrollYStyle
        },
        onScroll: onBodyScroll,
        ref: scrollBodyRef,
        className: `${prefixCls}-body`
      }, /*#__PURE__*/React.createElement(TableComponent, _extends({
        style: {
          ...scrollTableStyle,
          tableLayout: mergedTableLayout
        }
      }, ariaProps), captionElement, bodyColGroup, bodyTable, !fixFooter && summaryNode && /*#__PURE__*/React.createElement(_Footer.default, {
        stickyOffsets: stickyOffsets,
        flattenColumns: flattenColumns
      }, summaryNode)));
    }

    // Fixed holder share the props
    const fixedHolderProps = {
      noData: !mergedData.length,
      maxContentScroll: horizonScroll && mergedScrollX === 'max-content',
      ...headerProps,
      ...columnContext,
      direction,
      stickyClassName,
      scrollX: mergedScrollX,
      tableLayout: mergedTableLayout,
      onScroll: onInternalScroll
    };
    groupTableNode = /*#__PURE__*/React.createElement(React.Fragment, null, showHeader !== false && /*#__PURE__*/React.createElement(_FixedHolder.default, _extends({}, fixedHolderProps, {
      stickyTopOffset: offsetHeader,
      className: `${prefixCls}-header`,
      ref: scrollHeaderRef,
      colGroup: bodyColGroup
    }), renderFixedHeaderTable), bodyContent, fixFooter && fixFooter !== 'top' && /*#__PURE__*/React.createElement(_FixedHolder.default, _extends({}, fixedHolderProps, {
      stickyBottomOffset: offsetSummary,
      className: `${prefixCls}-summary`,
      ref: scrollSummaryRef,
      colGroup: bodyColGroup
    }), renderFixedFooterTable), isSticky && scrollBodyRef.current && scrollBodyRef.current instanceof Element && /*#__PURE__*/React.createElement(_stickyScrollBar.default, {
      ref: stickyRef,
      offsetScroll: offsetScroll,
      scrollBodyRef: scrollBodyRef,
      onScroll: onInternalScroll,
      container: container,
      direction: direction
    }));
  } else {
    // >>>>>> Unique table
    groupTableNode = /*#__PURE__*/React.createElement("div", {
      style: {
        ...scrollXStyle,
        ...scrollYStyle,
        ...styles?.content
      },
      className: (0, _clsx.clsx)(`${prefixCls}-content`, classNames?.content),
      onScroll: onInternalScroll,
      ref: scrollBodyRef
    }, /*#__PURE__*/React.createElement(TableComponent, _extends({
      style: {
        ...scrollTableStyle,
        tableLayout: mergedTableLayout
      }
    }, ariaProps), captionElement, bodyColGroup, showHeader !== false && /*#__PURE__*/React.createElement(_Header.default, _extends({}, headerProps, columnContext)), bodyTable, summaryNode && /*#__PURE__*/React.createElement(_Footer.default, {
      stickyOffsets: stickyOffsets,
      flattenColumns: flattenColumns
    }, summaryNode)));
  }
  const tableStyle = {
    ...style
  };

  // Add css var for sticky header `zIndex` calc
  if (isSticky) {
    tableStyle['--columns-count'] = flattenColumns.length;
  }
  let fullTable = /*#__PURE__*/React.createElement("div", _extends({
    className: (0, _clsx.clsx)(prefixCls, className, {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-fix-start-shadow`]: horizonScroll,
      [`${prefixCls}-fix-end-shadow`]: horizonScroll,
      [`${prefixCls}-fix-start-shadow-show`]: horizonScroll && shadowStart,
      [`${prefixCls}-fix-end-shadow-show`]: horizonScroll && shadowEnd,
      [`${prefixCls}-layout-fixed`]: tableLayout === 'fixed',
      [`${prefixCls}-fixed-header`]: fixHeader,
      /** No used but for compatible */
      [`${prefixCls}-fixed-column`]: fixColumn,
      [`${prefixCls}-scroll-horizontal`]: horizonScroll,
      [`${prefixCls}-has-fix-start`]: flattenColumns[0]?.fixed,
      [`${prefixCls}-has-fix-end`]: flattenColumns[flattenColumns.length - 1]?.fixed === 'end'
    }),
    style: tableStyle,
    id: id,
    ref: fullTableRef
  }, dataProps), title && /*#__PURE__*/React.createElement(_Panel.default, {
    className: (0, _clsx.clsx)(`${prefixCls}-title`, classNames?.title),
    style: styles?.title
  }, title(mergedData)), /*#__PURE__*/React.createElement("div", {
    ref: scrollBodyContainerRef,
    className: (0, _clsx.clsx)(`${prefixCls}-container`, classNames?.section),
    style: styles?.section
  }, groupTableNode), footer && /*#__PURE__*/React.createElement(_Panel.default, {
    className: (0, _clsx.clsx)(`${prefixCls}-footer`, classNames?.footer),
    style: styles?.footer
  }, footer(mergedData)));
  if (horizonScroll) {
    fullTable = /*#__PURE__*/React.createElement(_resizeObserver.default, {
      onResize: ({
        offsetWidth
      }) => onFullTableResize(offsetWidth)
    }, fullTable);
  }
  const fixedInfoList = (0, _useFixedInfo.default)(flattenColumns, stickyOffsets);
  const TableContextValue = React.useMemo(() => ({
    // Scroll
    scrollX: mergedScrollX,
    scrollInfo,
    classNames,
    styles,
    // Table
    prefixCls,
    getComponent,
    scrollbarSize,
    direction,
    fixedInfoList,
    isSticky,
    componentWidth,
    fixHeader,
    fixColumn,
    horizonScroll,
    // Body
    tableLayout: mergedTableLayout,
    rowClassName,
    expandedRowClassName: expandableConfig.expandedRowClassName,
    expandIcon: mergedExpandIcon,
    expandableType,
    expandRowByClick: expandableConfig.expandRowByClick,
    expandedRowRender: expandableConfig.expandedRowRender,
    expandedRowOffset: expandableConfig.expandedRowOffset,
    onTriggerExpand,
    expandIconColumnIndex: expandableConfig.expandIconColumnIndex,
    indentSize: expandableConfig.indentSize,
    allColumnsFixedLeft: flattenColumns.every(col => col.fixed === 'start'),
    emptyNode,
    // Column
    columns,
    flattenColumns,
    onColumnResize,
    colWidths,
    // Row
    hoverStartRow: startRow,
    hoverEndRow: endRow,
    onHover,
    rowExpandable: expandableConfig.rowExpandable,
    onRow,
    getRowKey,
    expandedKeys: mergedExpandedKeys,
    childrenColumnName: mergedChildrenColumnName,
    rowHoverable,
    // Measure Row
    measureRowRender
  }), [
  // Scroll
  mergedScrollX, scrollInfo, classNames, styles,
  // Table
  prefixCls, getComponent, scrollbarSize, direction, fixedInfoList, isSticky, componentWidth, fixHeader, fixColumn, horizonScroll,
  // Body
  mergedTableLayout, rowClassName, expandableConfig.expandedRowClassName, mergedExpandIcon, expandableType, expandableConfig.expandRowByClick, expandableConfig.expandedRowRender, expandableConfig.expandedRowOffset, onTriggerExpand, expandableConfig.expandIconColumnIndex, expandableConfig.indentSize, emptyNode,
  // Column
  columns, flattenColumns, onColumnResize, colWidths,
  // Row
  startRow, endRow, onHover, expandableConfig.rowExpandable, onRow, getRowKey, mergedExpandedKeys, mergedChildrenColumnName, rowHoverable, measureRowRender]);
  return /*#__PURE__*/React.createElement(_TableContext.default.Provider, {
    value: TableContextValue
  }, fullTable);
};
const RefTable = /*#__PURE__*/React.forwardRef(Table);
if (process.env.NODE_ENV !== 'production') {
  RefTable.displayName = 'Table';
}
const genTable = shouldTriggerRender => {
  return (0, _TableContext.makeImmutable)(RefTable, shouldTriggerRender);
};
exports.genTable = genTable;
const ImmutableTable = genTable();
ImmutableTable.EXPAND_COLUMN = _constant.EXPAND_COLUMN;
ImmutableTable.INTERNAL_HOOKS = _constant.INTERNAL_HOOKS;
ImmutableTable.Column = _Column.default;
ImmutableTable.ColumnGroup = _ColumnGroup.default;
ImmutableTable.Summary = _Footer.FooterComponents;
var _default = exports.default = ImmutableTable;