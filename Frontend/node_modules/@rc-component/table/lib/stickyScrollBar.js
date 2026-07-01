"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _context = require("@rc-component/context");
var _clsx = require("clsx");
var _getScrollBarSize = _interopRequireDefault(require("@rc-component/util/lib/getScrollBarSize"));
var React = _interopRequireWildcard(require("react"));
var _TableContext = _interopRequireDefault(require("./context/TableContext"));
var _useFrame = require("./hooks/useFrame");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _offsetUtil = require("./utils/offsetUtil");
var _findDOMNode = require("@rc-component/util/lib/Dom/findDOMNode");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const MOUSEUP_EVENT = 'mouseup';
const MOUSEMOVE_EVENT = 'mousemove';
const SCROLL_EVENT = 'scroll';
const RESIZE_EVENT = 'resize';
const StickyScrollBar = (props, ref) => {
  const {
    scrollBodyRef,
    onScroll,
    offsetScroll,
    container,
    direction
  } = props;
  const prefixCls = (0, _context.useContext)(_TableContext.default, 'prefixCls');
  const bodyScrollWidth = scrollBodyRef.current?.scrollWidth || 0;
  const bodyWidth = scrollBodyRef.current?.clientWidth || 0;
  const scrollBarWidth = bodyScrollWidth && bodyWidth * (bodyWidth / bodyScrollWidth);
  const scrollBarRef = React.useRef(null);
  const [scrollState, setScrollState] = (0, _useFrame.useLayoutState)({
    scrollLeft: 0,
    isHiddenScrollBar: true
  });
  const refState = React.useRef({
    delta: 0,
    x: 0
  });
  const [isActive, setActive] = React.useState(false);
  const rafRef = React.useRef(null);
  React.useEffect(() => () => {
    _raf.default.cancel(rafRef.current);
  }, []);
  const onMouseUp = () => {
    setActive(false);
  };
  const onMouseDown = event => {
    event.persist();
    refState.current.delta = event.pageX - scrollState.scrollLeft;
    refState.current.x = 0;
    setActive(true);
    event.preventDefault();
  };
  const onMouseMove = event => {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const {
      buttons
    } = event || window?.event;
    if (!isActive || buttons === 0) {
      // If out body mouse up, we can set isActive false when mouse move
      if (isActive) {
        setActive(false);
      }
      return;
    }
    let left = refState.current.x + event.pageX - refState.current.x - refState.current.delta;
    const isRTL = direction === 'rtl';
    // Limit scroll range
    left = Math.max(isRTL ? scrollBarWidth - bodyWidth : 0, Math.min(isRTL ? 0 : bodyWidth - scrollBarWidth, left));
    // Calculate the scroll position and update
    const shouldScroll = !isRTL || Math.abs(left) + Math.abs(scrollBarWidth) < bodyWidth;
    if (shouldScroll) {
      onScroll({
        scrollLeft: left / bodyWidth * (bodyScrollWidth + 2)
      });
      refState.current.x = event.pageX;
    }
  };
  const checkScrollBarVisible = () => {
    _raf.default.cancel(rafRef.current);
    rafRef.current = (0, _raf.default)(() => {
      if (!scrollBodyRef.current) {
        return;
      }
      const tableOffsetTop = (0, _offsetUtil.getOffset)(scrollBodyRef.current).top;
      const tableBottomOffset = tableOffsetTop + scrollBodyRef.current.offsetHeight;
      const currentClientOffset = container === window ? document.documentElement.scrollTop + window.innerHeight : (0, _offsetUtil.getOffset)(container).top + container.clientHeight;
      if (tableBottomOffset - (0, _getScrollBarSize.default)() <= currentClientOffset || tableOffsetTop >= currentClientOffset - offsetScroll) {
        setScrollState(state => ({
          ...state,
          isHiddenScrollBar: true
        }));
      } else {
        setScrollState(state => ({
          ...state,
          isHiddenScrollBar: false
        }));
      }
    });
  };
  const setScrollLeft = left => {
    setScrollState(state => {
      return {
        ...state,
        scrollLeft: left / bodyScrollWidth * bodyWidth || 0
      };
    });
  };
  React.useImperativeHandle(ref, () => ({
    setScrollLeft,
    checkScrollBarVisible
  }));
  React.useEffect(() => {
    document.body.addEventListener(MOUSEUP_EVENT, onMouseUp, false);
    document.body.addEventListener(MOUSEMOVE_EVENT, onMouseMove, false);
    checkScrollBarVisible();
    return () => {
      document.body.removeEventListener(MOUSEUP_EVENT, onMouseUp);
      document.body.removeEventListener(MOUSEMOVE_EVENT, onMouseMove);
    };
  }, [scrollBarWidth, isActive]);

  // Loop for scroll event check
  React.useEffect(() => {
    if (scrollBodyRef.current) {
      const scrollParents = [];
      let parent = (0, _findDOMNode.getDOM)(scrollBodyRef.current);
      while (parent) {
        scrollParents.push(parent);
        parent = parent.parentElement;
      }
      scrollParents.forEach(p => {
        p.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      });
      window.addEventListener(RESIZE_EVENT, checkScrollBarVisible, false);
      window.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      container.addEventListener(SCROLL_EVENT, checkScrollBarVisible, false);
      return () => {
        scrollParents.forEach(p => {
          p.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
        });
        window.removeEventListener(RESIZE_EVENT, checkScrollBarVisible);
        window.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
        container.removeEventListener(SCROLL_EVENT, checkScrollBarVisible);
      };
    }
  }, [container]);
  React.useEffect(() => {
    if (!scrollState.isHiddenScrollBar) {
      setScrollState(state => {
        const bodyNode = scrollBodyRef.current;
        if (!bodyNode) {
          return state;
        }
        return {
          ...state,
          scrollLeft: bodyNode.scrollLeft / bodyNode.scrollWidth * bodyNode.clientWidth
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollState.isHiddenScrollBar]);
  if (bodyScrollWidth <= bodyWidth || !scrollBarWidth || scrollState.isHiddenScrollBar) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: (0, _getScrollBarSize.default)(),
      width: bodyWidth,
      bottom: offsetScroll
    },
    className: `${prefixCls}-sticky-scroll`
  }, /*#__PURE__*/React.createElement("div", {
    onMouseDown: onMouseDown,
    ref: scrollBarRef,
    className: (0, _clsx.clsx)(`${prefixCls}-sticky-scroll-bar`, {
      [`${prefixCls}-sticky-scroll-bar-active`]: isActive
    }),
    style: {
      width: `${scrollBarWidth}px`,
      transform: `translate3d(${scrollState.scrollLeft}px, 0, 0)`
    }
  }));
};
var _default = exports.default = /*#__PURE__*/React.forwardRef(StickyScrollBar);