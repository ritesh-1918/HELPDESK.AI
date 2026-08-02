import CSSMotion from '@rc-component/motion';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import * as React from 'react';
const calcThumbStyle = (targetElement, vertical) => {
  if (!targetElement) return null;
  const style = {
    left: targetElement.offsetLeft,
    right: targetElement.parentElement.clientWidth - targetElement.clientWidth - targetElement.offsetLeft,
    width: targetElement.clientWidth,
    top: targetElement.offsetTop,
    bottom: targetElement.parentElement.clientHeight - targetElement.clientHeight - targetElement.offsetTop,
    height: targetElement.clientHeight
  };
  if (vertical) {
    // Adjusts positioning and size for vertical layout by setting horizontal properties to 0 and using vertical properties from the style object.
    return {
      left: 0,
      right: 0,
      width: 0,
      top: style.top,
      bottom: style.bottom,
      height: style.height
    };
  }
  return {
    left: style.left,
    right: style.right,
    width: style.width,
    top: 0,
    bottom: 0,
    height: 0
  };
};
const toPX = value => value !== undefined ? `${value}px` : undefined;
export default function MotionThumb(props) {
  const {
    prefixCls,
    containerRef,
    value,
    getValueIndex,
    motionName,
    onMotionStart,
    onMotionEnd,
    direction,
    vertical = false
  } = props;
  const thumbRef = React.useRef(null);
  const [prevValue, setPrevValue] = React.useState(value);

  // =========================== Effect ===========================
  const findValueElement = val => {
    const index = getValueIndex(val);
    const ele = containerRef.current?.querySelectorAll(`.${prefixCls}-item`)[index];
    return ele?.offsetParent && ele;
  };
  const [prevStyle, setPrevStyle] = React.useState(null);
  const [nextStyle, setNextStyle] = React.useState(null);
  useLayoutEffect(() => {
    if (prevValue !== value) {
      const prev = findValueElement(prevValue);
      const next = findValueElement(value);
      const calcPrevStyle = calcThumbStyle(prev, vertical);
      const calcNextStyle = calcThumbStyle(next, vertical);
      setPrevValue(value);
      setPrevStyle(calcPrevStyle);
      setNextStyle(calcNextStyle);
      if (prev && next) {
        onMotionStart();
      } else {
        onMotionEnd();
      }
    }
  }, [value]);
  const thumbStart = React.useMemo(() => {
    if (vertical) {
      return toPX(prevStyle?.top ?? 0);
    }
    if (direction === 'rtl') {
      return toPX(-prevStyle?.right);
    }
    return toPX(prevStyle?.left);
  }, [vertical, direction, prevStyle]);
  const thumbActive = React.useMemo(() => {
    if (vertical) {
      return toPX(nextStyle?.top ?? 0);
    }
    if (direction === 'rtl') {
      return toPX(-nextStyle?.right);
    }
    return toPX(nextStyle?.left);
  }, [vertical, direction, nextStyle]);

  // =========================== Motion ===========================
  const onAppearStart = () => {
    if (vertical) {
      return {
        transform: 'translateY(var(--thumb-start-top))',
        height: 'var(--thumb-start-height)'
      };
    }
    return {
      transform: 'translateX(var(--thumb-start-left))',
      width: 'var(--thumb-start-width)'
    };
  };
  const onAppearActive = () => {
    if (vertical) {
      return {
        transform: 'translateY(var(--thumb-active-top))',
        height: 'var(--thumb-active-height)'
      };
    }
    return {
      transform: 'translateX(var(--thumb-active-left))',
      width: 'var(--thumb-active-width)'
    };
  };
  const onVisibleChanged = () => {
    setPrevStyle(null);
    setNextStyle(null);
    onMotionEnd();
  };

  // =========================== Render ===========================
  // No need motion when nothing exist in queue
  if (!prevStyle || !nextStyle) {
    return null;
  }
  return /*#__PURE__*/React.createElement(CSSMotion, {
    visible: true,
    motionName: motionName,
    motionAppear: true,
    onAppearStart: onAppearStart,
    onAppearActive: onAppearActive,
    onVisibleChanged: onVisibleChanged
  }, ({
    className: motionClassName,
    style: motionStyle
  }, ref) => {
    const mergedStyle = {
      ...motionStyle,
      '--thumb-start-left': thumbStart,
      '--thumb-start-width': toPX(prevStyle?.width),
      '--thumb-active-left': thumbActive,
      '--thumb-active-width': toPX(nextStyle?.width),
      '--thumb-start-top': thumbStart,
      '--thumb-start-height': toPX(prevStyle?.height),
      '--thumb-active-top': thumbActive,
      '--thumb-active-height': toPX(nextStyle?.height)
    };

    // It's little ugly which should be refactor when @umi/test update to latest jsdom
    const motionProps = {
      ref: composeRef(thumbRef, ref),
      style: mergedStyle,
      className: clsx(`${prefixCls}-thumb`, motionClassName)
    };
    if (process.env.NODE_ENV === 'test') {
      motionProps['data-test-style'] = JSON.stringify(mergedStyle);
    }
    return /*#__PURE__*/React.createElement("div", motionProps);
  });
}