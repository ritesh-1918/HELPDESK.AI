import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import ResizeObserver from '@rc-component/resize-observer';
import { clsx } from 'clsx';
/**
 * Fill component to provided the scroll content real height.
 */
const Filler = /*#__PURE__*/React.forwardRef(({
  height,
  offsetY,
  offsetX,
  children,
  prefixCls,
  onInnerResize,
  innerProps,
  rtl,
  extra
}, ref) => {
  let outerStyle = {};
  let innerStyle = {
    display: 'flex',
    flexDirection: 'column'
  };
  if (offsetY !== undefined) {
    // Not set `width` since this will break `sticky: right`
    outerStyle = {
      height,
      position: 'relative',
      overflow: 'hidden'
    };
    innerStyle = {
      ...innerStyle,
      transform: `translateY(${offsetY}px)`,
      [rtl ? 'marginRight' : 'marginLeft']: -offsetX,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0
    };
  }
  return /*#__PURE__*/React.createElement("div", {
    style: outerStyle
  }, /*#__PURE__*/React.createElement(ResizeObserver, {
    onResize: ({
      offsetHeight
    }) => {
      if (offsetHeight && onInnerResize) {
        onInnerResize();
      }
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    style: innerStyle,
    className: clsx({
      [`${prefixCls}-holder-inner`]: prefixCls
    }),
    ref: ref
  }, innerProps), children, extra)));
});
Filler.displayName = 'Filler';
export default Filler;