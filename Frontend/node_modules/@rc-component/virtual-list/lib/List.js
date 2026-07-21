"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RawList = RawList;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _clsx = require("clsx");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _util = require("@rc-component/util");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _reactDom = require("react-dom");
var _Filler = _interopRequireDefault(require("./Filler"));
var _useChildren = _interopRequireDefault(require("./hooks/useChildren"));
var _useDiffItem = _interopRequireDefault(require("./hooks/useDiffItem"));
var _useFrameWheel = _interopRequireDefault(require("./hooks/useFrameWheel"));
var _useGetSize = require("./hooks/useGetSize");
var _useHeights = _interopRequireDefault(require("./hooks/useHeights"));
var _useMobileTouchMove = _interopRequireDefault(require("./hooks/useMobileTouchMove"));
var _useOriginScroll = _interopRequireDefault(require("./hooks/useOriginScroll"));
var _useScrollDrag = _interopRequireDefault(require("./hooks/useScrollDrag"));
var _useScrollTo = _interopRequireDefault(require("./hooks/useScrollTo"));
var _ScrollBar = _interopRequireDefault(require("./ScrollBar"));
var _scrollbarUtil = require("./utils/scrollbarUtil");
const EMPTY_DATA = [];
const ScrollStyle = {
  overflowY: 'auto',
  overflowAnchor: 'none'
};
function RawList(props, ref) {
  const {
    prefixCls = 'rc-virtual-list',
    className,
    height,
    itemHeight,
    fullHeight = true,
    style,
    data,
    children,
    itemKey,
    virtual,
    direction,
    scrollWidth,
    component: Component = 'div',
    onScroll,
    onVirtualScroll,
    onVisibleChange,
    innerProps,
    extraRender,
    styles,
    showScrollBar = 'optional',
    ...restProps
  } = props;

  // =============================== Item Key ===============================
  const getKey = React.useCallback(item => {
    if (typeof itemKey === 'function') {
      return itemKey(item);
    }
    return item?.[itemKey];
  }, [itemKey]);

  // ================================ Height ================================
  const [setInstanceRef, collectHeight, heights, heightUpdatedMark] = (0, _useHeights.default)(getKey, null, null);

  // ================================= MISC =================================
  const useVirtual = !!(virtual !== false && height && itemHeight);
  const containerHeight = React.useMemo(() => Object.values(heights.maps).reduce((total, curr) => total + curr, 0), [heights.id, heights.maps]);
  const inVirtual = useVirtual && data && (Math.max(itemHeight * data.length, containerHeight) > height || !!scrollWidth);
  const isRTL = direction === 'rtl';
  const mergedClassName = (0, _clsx.clsx)(prefixCls, {
    [`${prefixCls}-rtl`]: isRTL
  }, className);
  const mergedData = data || EMPTY_DATA;
  const componentRef = (0, _react.useRef)();
  const fillerInnerRef = (0, _react.useRef)();
  const containerRef = (0, _react.useRef)();

  // =============================== Item Key ===============================

  const [offsetTop, setOffsetTop] = (0, _react.useState)(0);
  const [offsetLeft, setOffsetLeft] = (0, _react.useState)(0);
  const [scrollMoving, setScrollMoving] = (0, _react.useState)(false);
  const onScrollbarStartMove = () => {
    setScrollMoving(true);
  };
  const onScrollbarStopMove = () => {
    setScrollMoving(false);
  };
  const sharedConfig = {
    getKey
  };

  // ================================ Scroll ================================
  function syncScrollTop(newTop) {
    setOffsetTop(origin => {
      let value;
      if (typeof newTop === 'function') {
        value = newTop(origin);
      } else {
        value = newTop;
      }
      const alignedTop = keepInRange(value);
      componentRef.current.scrollTop = alignedTop;
      return alignedTop;
    });
  }

  // ================================ Legacy ================================
  // Put ref here since the range is generate by follow
  const rangeRef = (0, _react.useRef)({
    start: 0,
    end: mergedData.length
  });
  const diffItemRef = (0, _react.useRef)();
  const [diffItem] = (0, _useDiffItem.default)(mergedData, getKey);
  diffItemRef.current = diffItem;

  // ========================== Visible Calculation =========================
  const {
    scrollHeight,
    start,
    end,
    offset: fillerOffset
  } = React.useMemo(() => {
    if (!useVirtual) {
      return {
        scrollHeight: undefined,
        start: 0,
        end: mergedData.length - 1,
        offset: undefined
      };
    }

    // Always use virtual scroll bar in avoid shaking
    if (!inVirtual) {
      return {
        scrollHeight: fillerInnerRef.current?.offsetHeight || 0,
        start: 0,
        end: mergedData.length - 1,
        offset: undefined
      };
    }
    let itemTop = 0;
    let startIndex;
    let startOffset;
    let endIndex;
    const dataLen = mergedData.length;
    for (let i = 0; i < dataLen; i += 1) {
      const item = mergedData[i];
      const key = getKey(item);
      const cacheHeight = heights.get(key);
      const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

      // Check item top in the range
      if (currentItemBottom >= offsetTop && startIndex === undefined) {
        startIndex = i;
        startOffset = itemTop;
      }

      // Check item bottom in the range. We will render additional one item for motion usage
      if (currentItemBottom > offsetTop + height && endIndex === undefined) {
        endIndex = i;
      }
      itemTop = currentItemBottom;
    }

    // When scrollTop at the end but data cut to small count will reach this
    if (startIndex === undefined) {
      startIndex = 0;
      startOffset = 0;
      endIndex = Math.ceil(height / itemHeight);
    }
    if (endIndex === undefined) {
      endIndex = mergedData.length - 1;
    }

    // Give cache to improve scroll experience
    endIndex = Math.min(endIndex + 1, mergedData.length - 1);
    return {
      scrollHeight: itemTop,
      start: startIndex,
      end: endIndex,
      offset: startOffset
    };
  }, [inVirtual, useVirtual, offsetTop, mergedData, heightUpdatedMark, height]);
  rangeRef.current.start = start;
  rangeRef.current.end = end;

  // When scroll up, first visible item get real height may not same as `itemHeight`,
  // Which will make scroll jump.
  // Let's sync scroll top to avoid jump
  React.useLayoutEffect(() => {
    const changedRecord = heights.getRecord();
    if (changedRecord.size === 1) {
      const recordKey = Array.from(changedRecord.keys())[0];
      const prevCacheHeight = changedRecord.get(recordKey);

      // Quick switch data may cause `start` not in `mergedData` anymore
      const startItem = mergedData[start];
      if (startItem && prevCacheHeight === undefined) {
        const startIndexKey = getKey(startItem);
        if (startIndexKey === recordKey) {
          const realStartHeight = heights.get(recordKey);
          const diffHeight = realStartHeight - itemHeight;
          syncScrollTop(ori => {
            return ori + diffHeight;
          });
        }
      }
    }
    heights.resetRecord();
  }, [scrollHeight]);

  // ================================= Size =================================
  const [size, setSize] = React.useState({
    width: 0,
    height
  });
  const onHolderResize = sizeInfo => {
    setSize({
      width: sizeInfo.offsetWidth,
      height: sizeInfo.offsetHeight
    });
  };

  // Hack on scrollbar to enable flash call
  const verticalScrollBarRef = (0, _react.useRef)();
  const horizontalScrollBarRef = (0, _react.useRef)();
  const horizontalScrollBarSpinSize = React.useMemo(() => (0, _scrollbarUtil.getSpinSize)(size.width, scrollWidth), [size.width, scrollWidth]);
  const verticalScrollBarSpinSize = React.useMemo(() => (0, _scrollbarUtil.getSpinSize)(size.height, scrollHeight), [size.height, scrollHeight]);

  // =============================== In Range ===============================
  const maxScrollHeight = scrollHeight - height;
  const maxScrollHeightRef = (0, _react.useRef)(maxScrollHeight);
  maxScrollHeightRef.current = maxScrollHeight;
  function keepInRange(newScrollTop) {
    let newTop = newScrollTop;
    if (!Number.isNaN(maxScrollHeightRef.current)) {
      newTop = Math.min(newTop, maxScrollHeightRef.current);
    }
    newTop = Math.max(newTop, 0);
    return newTop;
  }
  const isScrollAtTop = offsetTop <= 0;
  const isScrollAtBottom = offsetTop >= maxScrollHeight;
  const isScrollAtLeft = offsetLeft <= 0;
  const isScrollAtRight = offsetLeft >= scrollWidth;
  const originScroll = (0, _useOriginScroll.default)(isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight);

  // ================================ Scroll ================================
  const getVirtualScrollInfo = () => ({
    x: isRTL ? -offsetLeft : offsetLeft,
    y: offsetTop
  });
  const lastVirtualScrollInfoRef = (0, _react.useRef)(getVirtualScrollInfo());
  const triggerScroll = (0, _util.useEvent)(params => {
    if (onVirtualScroll) {
      const nextInfo = {
        ...getVirtualScrollInfo(),
        ...params
      };

      // Trigger when offset changed
      if (lastVirtualScrollInfoRef.current.x !== nextInfo.x || lastVirtualScrollInfoRef.current.y !== nextInfo.y) {
        onVirtualScroll(nextInfo);
        lastVirtualScrollInfoRef.current = nextInfo;
      }
    }
  });
  function onScrollBar(newScrollOffset, horizontal) {
    const newOffset = newScrollOffset;
    if (horizontal) {
      (0, _reactDom.flushSync)(() => {
        setOffsetLeft(newOffset);
      });
      triggerScroll();
    } else {
      syncScrollTop(newOffset);
    }
  }

  // When data size reduce. It may trigger native scroll event back to fit scroll position
  function onFallbackScroll(e) {
    const {
      scrollTop: newScrollTop
    } = e.currentTarget;
    if (newScrollTop !== offsetTop) {
      syncScrollTop(newScrollTop);
    }

    // Trigger origin onScroll
    onScroll?.(e);
    triggerScroll();
  }
  const keepInHorizontalRange = nextOffsetLeft => {
    let tmpOffsetLeft = nextOffsetLeft;
    const max = !!scrollWidth ? scrollWidth - size.width : 0;
    tmpOffsetLeft = Math.max(tmpOffsetLeft, 0);
    tmpOffsetLeft = Math.min(tmpOffsetLeft, max);
    return tmpOffsetLeft;
  };
  const onWheelDelta = (0, _util.useEvent)((offsetXY, fromHorizontal) => {
    if (fromHorizontal) {
      (0, _reactDom.flushSync)(() => {
        setOffsetLeft(left => {
          const nextOffsetLeft = left + (isRTL ? -offsetXY : offsetXY);
          return keepInHorizontalRange(nextOffsetLeft);
        });
      });
      triggerScroll();
    } else {
      syncScrollTop(top => {
        const newTop = top + offsetXY;
        return newTop;
      });
    }
  });

  // Since this added in global,should use ref to keep update
  const [onRawWheel, onFireFoxScroll] = (0, _useFrameWheel.default)(useVirtual, isScrollAtTop, isScrollAtBottom, isScrollAtLeft, isScrollAtRight, !!scrollWidth, onWheelDelta);

  // Mobile touch move
  (0, _useMobileTouchMove.default)(useVirtual, componentRef, (isHorizontal, delta, smoothOffset, e) => {
    const event = e;
    if (originScroll(isHorizontal, delta, smoothOffset)) {
      return false;
    }

    // Fix nest List trigger TouchMove event
    if (!event || !event._virtualHandled) {
      if (event) {
        event._virtualHandled = true;
      }
      onRawWheel({
        preventDefault() {},
        deltaX: isHorizontal ? delta : 0,
        deltaY: isHorizontal ? 0 : delta
      });
      return true;
    }
    return false;
  });

  // MouseDown drag for scroll
  (0, _useScrollDrag.default)(inVirtual, componentRef, offset => {
    syncScrollTop(top => top + offset);
  });
  (0, _useLayoutEffect.default)(() => {
    // Firefox only
    function onMozMousePixelScroll(e) {
      // scrolling at top/bottom limit
      const scrollingUpAtTop = isScrollAtTop && e.detail < 0;
      const scrollingDownAtBottom = isScrollAtBottom && e.detail > 0;
      if (useVirtual && !scrollingUpAtTop && !scrollingDownAtBottom) {
        e.preventDefault();
      }
    }
    const componentEle = componentRef.current;
    componentEle.addEventListener('wheel', onRawWheel, {
      passive: false
    });
    componentEle.addEventListener('DOMMouseScroll', onFireFoxScroll, {
      passive: true
    });
    componentEle.addEventListener('MozMousePixelScroll', onMozMousePixelScroll, {
      passive: false
    });
    return () => {
      componentEle.removeEventListener('wheel', onRawWheel);
      componentEle.removeEventListener('DOMMouseScroll', onFireFoxScroll);
      componentEle.removeEventListener('MozMousePixelScroll', onMozMousePixelScroll);
    };
  }, [useVirtual, isScrollAtTop, isScrollAtBottom]);

  // Sync scroll left
  (0, _useLayoutEffect.default)(() => {
    if (scrollWidth) {
      const newOffsetLeft = keepInHorizontalRange(offsetLeft);
      setOffsetLeft(newOffsetLeft);
      triggerScroll({
        x: newOffsetLeft
      });
    }
  }, [size.width, scrollWidth]);

  // ================================= Ref ==================================
  const delayHideScrollBar = () => {
    verticalScrollBarRef.current?.delayHidden();
    horizontalScrollBarRef.current?.delayHidden();
  };
  const scrollTo = (0, _useScrollTo.default)(componentRef, mergedData, heights, itemHeight, getKey, () => collectHeight(true), syncScrollTop, delayHideScrollBar);
  React.useImperativeHandle(ref, () => ({
    nativeElement: containerRef.current,
    getScrollInfo: getVirtualScrollInfo,
    scrollTo: config => {
      function isPosScroll(arg) {
        return arg && typeof arg === 'object' && ('left' in arg || 'top' in arg);
      }
      if (isPosScroll(config)) {
        // Scroll X
        if (config.left !== undefined) {
          setOffsetLeft(keepInHorizontalRange(config.left));
        }

        // Scroll Y
        scrollTo(config.top);
      } else {
        scrollTo(config);
      }
    }
  }));

  // ================================ Effect ================================
  /** We need told outside that some list not rendered */
  (0, _useLayoutEffect.default)(() => {
    if (onVisibleChange) {
      const renderList = mergedData.slice(start, end + 1);
      onVisibleChange(renderList, mergedData);
    }
  }, [start, end, mergedData]);

  // ================================ Extra =================================
  const getSize = (0, _useGetSize.useGetSize)(mergedData, getKey, heights, itemHeight);
  const extraContent = extraRender?.({
    start,
    end,
    virtual: inVirtual,
    offsetX: offsetLeft,
    offsetY: fillerOffset,
    rtl: isRTL,
    getSize
  });

  // ================================ Render ================================
  const listChildren = (0, _useChildren.default)(mergedData, start, end, scrollWidth, offsetLeft, setInstanceRef, children, sharedConfig);
  let componentStyle = null;
  if (height) {
    componentStyle = {
      [fullHeight ? 'height' : 'maxHeight']: height,
      ...ScrollStyle
    };
    if (useVirtual) {
      componentStyle.overflowY = 'hidden';
      if (scrollWidth) {
        componentStyle.overflowX = 'hidden';
      }
      if (scrollMoving) {
        componentStyle.pointerEvents = 'none';
      }
    }
  }
  const containerProps = {};
  if (isRTL) {
    containerProps.dir = 'rtl';
  }
  return /*#__PURE__*/React.createElement("div", (0, _extends2.default)({
    ref: containerRef,
    style: {
      ...style,
      position: 'relative'
    },
    className: mergedClassName
  }, containerProps, restProps), /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onHolderResize
  }, /*#__PURE__*/React.createElement(Component, {
    className: `${prefixCls}-holder`,
    style: componentStyle,
    ref: componentRef,
    onScroll: onFallbackScroll,
    onMouseEnter: delayHideScrollBar
  }, /*#__PURE__*/React.createElement(_Filler.default, {
    prefixCls: prefixCls,
    height: scrollHeight,
    offsetX: offsetLeft,
    offsetY: fillerOffset,
    scrollWidth: scrollWidth,
    onInnerResize: collectHeight,
    ref: fillerInnerRef,
    innerProps: innerProps,
    rtl: isRTL,
    extra: extraContent
  }, listChildren))), inVirtual && scrollHeight > height && /*#__PURE__*/React.createElement(_ScrollBar.default, {
    ref: verticalScrollBarRef,
    prefixCls: prefixCls,
    scrollOffset: offsetTop,
    scrollRange: scrollHeight,
    rtl: isRTL,
    onScroll: onScrollBar,
    onStartMove: onScrollbarStartMove,
    onStopMove: onScrollbarStopMove,
    spinSize: verticalScrollBarSpinSize,
    containerSize: size.height,
    style: styles?.verticalScrollBar,
    thumbStyle: styles?.verticalScrollBarThumb,
    showScrollBar: showScrollBar
  }), inVirtual && scrollWidth > size.width && /*#__PURE__*/React.createElement(_ScrollBar.default, {
    ref: horizontalScrollBarRef,
    prefixCls: prefixCls,
    scrollOffset: offsetLeft,
    scrollRange: scrollWidth,
    rtl: isRTL,
    onScroll: onScrollBar,
    onStartMove: onScrollbarStartMove,
    onStopMove: onScrollbarStopMove,
    spinSize: horizontalScrollBarSpinSize,
    containerSize: size.width,
    horizontal: true,
    style: styles?.horizontalScrollBar,
    thumbStyle: styles?.horizontalScrollBarThumb,
    showScrollBar: showScrollBar
  }));
}
const List = /*#__PURE__*/React.forwardRef(RawList);
List.displayName = 'List';
var _default = exports.default = List;