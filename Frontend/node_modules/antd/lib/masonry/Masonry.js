"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _motion = require("@rc-component/motion");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _responsiveObserver = require("../_util/responsiveObserver");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useBreakpoint = _interopRequireDefault(require("../grid/hooks/useBreakpoint"));
var _useGutter = _interopRequireDefault(require("../grid/hooks/useGutter"));
var _genStyleUtils = require("../theme/util/genStyleUtils");
var _useDelay = _interopRequireDefault(require("./hooks/useDelay"));
var _usePositions = _interopRequireDefault(require("./hooks/usePositions"));
var _useRefs = _interopRequireDefault(require("./hooks/useRefs"));
var _MasonryItem = _interopRequireDefault(require("./MasonryItem"));
var _style = _interopRequireDefault(require("./style"));
const Masonry = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    rootClassName,
    className,
    style,
    classNames,
    styles,
    columns,
    prefixCls: customizePrefixCls,
    gutter = 0,
    items,
    itemRender,
    onLayoutChange,
    fresh
  } = props;
  // ======================= MISC =======================
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('masonry');
  const prefixCls = getPrefixCls('masonry', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'masonry');
  // ======================= Refs =======================
  const containerRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: containerRef.current
  }));
  const [setItemRef, getItemRef] = (0, _useRefs.default)();
  // ======================= Item =======================
  const [mergedItems, setMergedItems] = React.useState([]);
  React.useEffect(() => {
    setMergedItems(items || []);
  }, [items]);
  // ==================== Breakpoint ====================
  const screens = (0, _useBreakpoint.default)();
  const gutters = (0, _useGutter.default)(gutter, screens);
  const [horizontalGutter = 0, verticalGutter = horizontalGutter] = gutters;
  // ====================== Layout ======================
  const columnCount = React.useMemo(() => {
    if (!columns) {
      return 3;
    }
    if (typeof columns === 'number') {
      return columns;
    }
    // Find first matching responsive breakpoint
    const matchingBreakpoint = _responsiveObserver.responsiveArray.find(breakpoint => screens[breakpoint] && columns[breakpoint] !== undefined);
    if (matchingBreakpoint) {
      return columns[matchingBreakpoint];
    }
    return columns.xs ?? 1;
  }, [columns, screens]);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    columns: columnCount
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ================== Items Position ==================
  const [itemHeights, setItemHeights] = React.useState([]);
  const collectItemSize = (0, _useDelay.default)(() => {
    const nextItemsHeight = mergedItems.map((item, index) => {
      const itemKey = item.key ?? index;
      const itemEle = getItemRef(itemKey);
      const rect = itemEle?.getBoundingClientRect();
      return [itemKey, rect ? rect.height : 0, item.column];
    });
    setItemHeights(prevItemsHeight => (0, _isEqual.default)(prevItemsHeight, nextItemsHeight) ? prevItemsHeight : nextItemsHeight);
  });
  const [itemPositions, totalHeight] = (0, _usePositions.default)(itemHeights, columnCount, verticalGutter);
  const itemWithPositions = React.useMemo(() => mergedItems.map((item, index) => {
    const key = item.key ?? index;
    return {
      item,
      itemIndex: index,
      // CSSMotion will transform key to string.
      // Let's keep the original key here.
      itemKey: key,
      key,
      position: itemPositions.get(key)
    };
  }), [mergedItems, itemPositions]);
  React.useEffect(() => {
    collectItemSize();
  }, [mergedItems, columnCount]);
  // Trigger for `onLayoutChange`
  const [itemColumns, setItemColumns] = React.useState([]);
  (0, _useLayoutEffect.default)(() => {
    if (onLayoutChange && itemWithPositions.every(({
      position
    }) => position)) {
      setItemColumns(prevItemColumns => {
        const nextItemColumns = itemWithPositions.map(({
          item,
          position
        }) => [item, position.column]);
        return (0, _isEqual.default)(prevItemColumns, nextItemColumns) ? prevItemColumns : nextItemColumns;
      });
    }
  }, [itemWithPositions]);
  (0, _useLayoutEffect.default)(() => {
    if (onLayoutChange && items && items.length === itemColumns.length) {
      onLayoutChange(itemColumns.map(([item, column]) => ({
        ...item,
        column
      })));
    }
  }, [itemColumns]);
  // ====================== Render ======================
  return /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: collectItemSize
  }, /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    className: (0, _clsx.clsx)(prefixCls, contextClassName, mergedClassNames.root, rootClassName, className, hashId, cssVarCls, {
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }),
    style: {
      height: totalHeight,
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    // Listen for image events
    onLoad: collectItemSize,
    onError: collectItemSize
  }, /*#__PURE__*/React.createElement(_motion.CSSMotionList, {
    keys: itemWithPositions,
    component: false,
    // Motion config
    motionAppear: true,
    motionLeave: true,
    motionName: `${prefixCls}-item-fade`
  }, (motionInfo, motionRef) => {
    const {
      item,
      itemKey,
      position = {},
      itemIndex,
      key,
      className: motionClassName,
      style: motionStyle
    } = motionInfo;
    const {
      column: columnIndex = 0
    } = position;
    const itemStyle = {
      [varName('item-width')]: `calc((100% + ${horizontalGutter}px) / ${columnCount})`,
      insetInlineStart: `calc(${varRef('item-width')} * ${columnIndex})`,
      width: `calc(${varRef('item-width')} - ${horizontalGutter}px)`,
      top: position.top,
      position: 'absolute'
    };
    return /*#__PURE__*/React.createElement(_MasonryItem.default, {
      prefixCls: prefixCls,
      key: key,
      item: item,
      style: {
        ...motionStyle,
        ...mergedStyles.item,
        ...itemStyle
      },
      className: (0, _clsx.clsx)(mergedClassNames.item, motionClassName),
      ref: (0, _ref.composeRef)(motionRef, ele => setItemRef(itemKey, ele)),
      index: itemIndex,
      itemRender: itemRender,
      column: columnIndex,
      onResize: fresh ? collectItemSize : null
    });
  })));
});
if (process.env.NODE_ENV !== 'production') {
  Masonry.displayName = 'Masonry';
}
var _default = exports.default = Masonry;