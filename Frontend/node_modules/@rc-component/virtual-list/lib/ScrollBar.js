"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var React = _interopRequireWildcard(require("react"));
var _useScrollDrag = require("./hooks/useScrollDrag");
const ScrollBar = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    rtl,
    scrollOffset,
    scrollRange,
    onStartMove,
    onStopMove,
    onScroll,
    horizontal,
    spinSize,
    containerSize,
    style,
    thumbStyle: propsThumbStyle,
    showScrollBar
  } = props;
  const [dragging, setDragging] = React.useState(false);
  const [pageXY, setPageXY] = React.useState(null);
  const [startTop, setStartTop] = React.useState(null);
  const isLTR = !rtl;

  // ========================= Refs =========================
  const scrollbarRef = React.useRef();
  const thumbRef = React.useRef();

  // ======================= Visible ========================
  const [visible, setVisible] = React.useState(showScrollBar);
  const visibleTimeoutRef = React.useRef();
  const delayHidden = () => {
    if (showScrollBar === true || showScrollBar === false) return;
    clearTimeout(visibleTimeoutRef.current);
    setVisible(true);
    visibleTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  // ======================== Range =========================
  const enableScrollRange = scrollRange - containerSize || 0;
  const enableOffsetRange = containerSize - spinSize || 0;

  // ========================= Top ==========================
  const top = React.useMemo(() => {
    if (scrollOffset === 0 || enableScrollRange === 0) {
      return 0;
    }
    const ptg = scrollOffset / enableScrollRange;
    return ptg * enableOffsetRange;
  }, [scrollOffset, enableScrollRange, enableOffsetRange]);

  // ====================== Container =======================
  const onContainerMouseDown = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  // ======================== Thumb =========================
  const stateRef = React.useRef({
    top,
    dragging,
    pageY: pageXY,
    startTop
  });
  stateRef.current = {
    top,
    dragging,
    pageY: pageXY,
    startTop
  };
  const onThumbMouseDown = e => {
    setDragging(true);
    setPageXY((0, _useScrollDrag.getPageXY)(e, horizontal));
    setStartTop(stateRef.current.top);
    onStartMove();
    e.stopPropagation();
    e.preventDefault();
  };

  // ======================== Effect ========================

  // React make event as passive, but we need to preventDefault
  // Add event on dom directly instead.
  // ref: https://github.com/facebook/react/issues/9809
  React.useEffect(() => {
    const onScrollbarTouchStart = e => {
      e.preventDefault();
    };
    const scrollbarEle = scrollbarRef.current;
    const thumbEle = thumbRef.current;
    scrollbarEle.addEventListener('touchstart', onScrollbarTouchStart, {
      passive: false
    });
    thumbEle.addEventListener('touchstart', onThumbMouseDown, {
      passive: false
    });
    return () => {
      scrollbarEle.removeEventListener('touchstart', onScrollbarTouchStart);
      thumbEle.removeEventListener('touchstart', onThumbMouseDown);
    };
  }, []);

  // Pass to effect
  const enableScrollRangeRef = React.useRef();
  enableScrollRangeRef.current = enableScrollRange;
  const enableOffsetRangeRef = React.useRef();
  enableOffsetRangeRef.current = enableOffsetRange;
  React.useEffect(() => {
    if (dragging) {
      let moveRafId;
      const onMouseMove = e => {
        const {
          dragging: stateDragging,
          pageY: statePageY,
          startTop: stateStartTop
        } = stateRef.current;
        _raf.default.cancel(moveRafId);
        const rect = scrollbarRef.current.getBoundingClientRect();
        const scale = containerSize / (horizontal ? rect.width : rect.height);
        if (stateDragging) {
          const offset = ((0, _useScrollDrag.getPageXY)(e, horizontal) - statePageY) * scale;
          let newTop = stateStartTop;
          if (!isLTR && horizontal) {
            newTop -= offset;
          } else {
            newTop += offset;
          }
          const tmpEnableScrollRange = enableScrollRangeRef.current;
          const tmpEnableOffsetRange = enableOffsetRangeRef.current;
          const ptg = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0;
          let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange);
          newScrollTop = Math.max(newScrollTop, 0);
          newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange);
          moveRafId = (0, _raf.default)(() => {
            onScroll(newScrollTop, horizontal);
          });
        }
      };
      const onMouseUp = () => {
        setDragging(false);
        onStopMove();
      };
      window.addEventListener('mousemove', onMouseMove, {
        passive: true
      });
      window.addEventListener('touchmove', onMouseMove, {
        passive: true
      });
      window.addEventListener('mouseup', onMouseUp, {
        passive: true
      });
      window.addEventListener('touchend', onMouseUp, {
        passive: true
      });
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchend', onMouseUp);
        _raf.default.cancel(moveRafId);
      };
    }
  }, [dragging]);
  React.useEffect(() => {
    delayHidden();
    return () => {
      clearTimeout(visibleTimeoutRef.current);
    };
  }, [scrollOffset]);

  // ====================== Imperative ======================
  React.useImperativeHandle(ref, () => ({
    delayHidden
  }));

  // ======================== Render ========================
  const scrollbarPrefixCls = `${prefixCls}-scrollbar`;
  const containerStyle = {
    position: 'absolute',
    visibility: visible ? null : 'hidden'
  };
  const thumbStyle = {
    position: 'absolute',
    borderRadius: 99,
    background: 'var(--rc-virtual-list-scrollbar-bg, rgba(0, 0, 0, 0.5))',
    cursor: 'pointer',
    userSelect: 'none'
  };
  if (horizontal) {
    Object.assign(containerStyle, {
      height: 8,
      left: 0,
      right: 0,
      bottom: 0
    });
    Object.assign(thumbStyle, {
      height: '100%',
      width: spinSize,
      [isLTR ? 'left' : 'right']: top
    });
  } else {
    Object.assign(containerStyle, {
      width: 8,
      top: 0,
      bottom: 0,
      [isLTR ? 'right' : 'left']: 0
    });
    Object.assign(thumbStyle, {
      width: '100%',
      height: spinSize,
      top
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: scrollbarRef,
    className: (0, _clsx.clsx)(scrollbarPrefixCls, {
      [`${scrollbarPrefixCls}-horizontal`]: horizontal,
      [`${scrollbarPrefixCls}-vertical`]: !horizontal,
      [`${scrollbarPrefixCls}-visible`]: visible
    }),
    style: {
      ...containerStyle,
      ...style
    },
    onMouseDown: onContainerMouseDown,
    onMouseMove: delayHidden
  }, /*#__PURE__*/React.createElement("div", {
    ref: thumbRef,
    className: (0, _clsx.clsx)(`${scrollbarPrefixCls}-thumb`, {
      [`${scrollbarPrefixCls}-thumb-moving`]: dragging
    }),
    style: {
      ...thumbStyle,
      ...propsThumbStyle
    },
    onMouseDown: onThumbMouseDown
  }));
});
if (process.env.NODE_ENV !== 'production') {
  ScrollBar.displayName = 'ScrollBar';
}
var _default = exports.default = ScrollBar;