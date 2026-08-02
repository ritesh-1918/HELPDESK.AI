"use client";

import * as React from 'react';
import SlickCarousel from '@ant-design/react-slick';
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useStyle, { DotDuration } from './style';
const dotsClass = 'slick-dots';
const ArrowButton = ({
  currentSlide,
  slideCount,
  ...rest
}) => (/*#__PURE__*/React.createElement("button", {
  type: "button",
  ...rest
}));
const Carousel = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    dots = true,
    arrows = false,
    prevArrow,
    nextArrow,
    draggable = false,
    waitForAnimate = false,
    dotPosition,
    dotPlacement,
    vertical,
    rootClassName,
    className: customClassName,
    style,
    id,
    autoplay = false,
    autoplaySpeed = 3000,
    rtl,
    ...otherProps
  } = props;
  const mergedDotPlacement = React.useMemo(() => {
    const placement = dotPlacement ?? dotPosition ?? 'bottom';
    switch (placement) {
      case 'left':
        return 'start';
      case 'right':
        return 'end';
      default:
        return placement;
    }
  }, [dotPosition, dotPlacement]);
  const mergedVertical = vertical ?? (mergedDotPlacement === 'start' || mergedDotPlacement === 'end');
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('carousel');
  const slickRef = React.useRef(null);
  const goTo = (slide, dontAnimate = false) => {
    slickRef.current.slickGoTo(slide, dontAnimate);
  };
  React.useImperativeHandle(ref, () => ({
    goTo,
    autoPlay: slickRef.current.innerSlider.autoPlay,
    innerSlider: slickRef.current.innerSlider,
    prev: slickRef.current.slickPrev,
    next: slickRef.current.slickNext
  }), [slickRef.current]);
  const {
    children,
    initialSlide = 0
  } = props;
  const childNodes = toArray(children);
  const count = childNodes.length;
  const isRTL = (rtl ?? direction === 'rtl') && !vertical;
  React.useEffect(() => {
    if (count > 0) {
      const newIndex = isRTL ? count - initialSlide - 1 : initialSlide;
      goTo(newIndex, false);
    }
  }, [count, initialSlide, isRTL]);
  // ========================== Warn ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Carousel');
    warning.deprecated(!dotPosition, 'dotPosition', 'dotPlacement');
  }
  const newProps = {
    vertical: mergedVertical,
    className: clsx(customClassName, contextClassName),
    style: {
      ...contextStyle,
      ...style
    },
    autoplay: !!autoplay,
    ...otherProps
  };
  if (newProps.effect === 'fade') {
    newProps.fade = true;
  }
  const prefixCls = getPrefixCls('carousel', newProps.prefixCls);
  const enableDots = !!dots;
  const dsClass = clsx(dotsClass, `${dotsClass}-${mergedDotPlacement}`, typeof dots === 'boolean' ? false : dots?.className);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const className = clsx(prefixCls, {
    [`${prefixCls}-rtl`]: isRTL,
    [`${prefixCls}-vertical`]: newProps.vertical
  }, hashId, cssVarCls, rootClassName);
  const mergedShowDuration = autoplay && (typeof autoplay === 'object' ? autoplay.dotDuration : false);
  const dotDurationStyle = mergedShowDuration ? {
    [DotDuration]: `${autoplaySpeed}ms`
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    id: id,
    style: dotDurationStyle
  }, /*#__PURE__*/React.createElement(SlickCarousel, {
    ref: slickRef,
    ...newProps,
    dots: enableDots,
    dotsClass: dsClass,
    arrows: arrows,
    prevArrow: prevArrow ?? /*#__PURE__*/React.createElement(ArrowButton, {
      "aria-label": isRTL ? 'next' : 'prev'
    }),
    nextArrow: nextArrow ?? /*#__PURE__*/React.createElement(ArrowButton, {
      "aria-label": isRTL ? 'prev' : 'next'
    }),
    draggable: draggable,
    verticalSwiping: mergedVertical,
    autoplaySpeed: autoplaySpeed,
    waitForAnimate: waitForAnimate,
    rtl: isRTL
  }));
});
if (process.env.NODE_ENV !== 'production') {
  Carousel.displayName = 'Carousel';
}
export default Carousel;