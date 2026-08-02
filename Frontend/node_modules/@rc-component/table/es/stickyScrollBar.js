import { useContext } from '@rc-component/context';
import { clsx } from 'clsx';
import getScrollBarSize from "@rc-component/util/es/getScrollBarSize";
import * as React from 'react';
import TableContext from "./context/TableContext";
import { useLayoutState } from "./hooks/useFrame";
import raf from "@rc-component/util/es/raf";
import { getOffset } from "./utils/offsetUtil";
import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
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
  const prefixCls = useContext(TableContext, 'prefixCls');
  const bodyScrollWidth = scrollBodyRef.current?.scrollWidth || 0;
  const bodyWidth = scrollBodyRef.current?.clientWidth || 0;
  const scrollBarWidth = bodyScrollWidth && bodyWidth * (bodyWidth / bodyScrollWidth);
  const scrollBarRef = React.useRef(null);
  const [scrollState, setScrollState] = useLayoutState({
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
    raf.cancel(rafRef.current);
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
    raf.cancel(rafRef.current);
    rafRef.current = raf(() => {
      if (!scrollBodyRef.current) {
        return;
      }
      const tableOffsetTop = getOffset(scrollBodyRef.current).top;
      const tableBottomOffset = tableOffsetTop + scrollBodyRef.current.offsetHeight;
      const currentClientOffset = container === window ? document.documentElement.scrollTop + window.innerHeight : getOffset(container).top + container.clientHeight;
      if (tableBottomOffset - getScrollBarSize() <= currentClientOffset || tableOffsetTop >= currentClientOffset - offsetScroll) {
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
      let parent = getDOM(scrollBodyRef.current);
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
      height: getScrollBarSize(),
      width: bodyWidth,
      bottom: offsetScroll
    },
    className: `${prefixCls}-sticky-scroll`
  }, /*#__PURE__*/React.createElement("div", {
    onMouseDown: onMouseDown,
    ref: scrollBarRef,
    className: clsx(`${prefixCls}-sticky-scroll-bar`, {
      [`${prefixCls}-sticky-scroll-bar-active`]: isActive
    }),
    style: {
      width: `${scrollBarWidth}px`,
      transform: `translate3d(${scrollState.scrollLeft}px, 0, 0)`
    }
  }));
};
export default /*#__PURE__*/React.forwardRef(StickyScrollBar);