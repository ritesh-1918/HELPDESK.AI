"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactSlick = _interopRequireDefault(require("@ant-design/react-slick"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _style = _interopRequireWildcard(require("./style"));
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
  } = (0, _context.useComponentConfig)('carousel');
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
  const childNodes = (0, _util.toArray)(children);
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
    const warning = (0, _warning.devUseWarning)('Carousel');
    warning.deprecated(!dotPosition, 'dotPosition', 'dotPlacement');
  }
  const newProps = {
    vertical: mergedVertical,
    className: (0, _clsx.clsx)(customClassName, contextClassName),
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
  const dsClass = (0, _clsx.clsx)(dotsClass, `${dotsClass}-${mergedDotPlacement}`, typeof dots === 'boolean' ? false : dots?.className);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const className = (0, _clsx.clsx)(prefixCls, {
    [`${prefixCls}-rtl`]: isRTL,
    [`${prefixCls}-vertical`]: newProps.vertical
  }, hashId, cssVarCls, rootClassName);
  const mergedShowDuration = autoplay && (typeof autoplay === 'object' ? autoplay.dotDuration : false);
  const dotDurationStyle = mergedShowDuration ? {
    [_style.DotDuration]: `${autoplaySpeed}ms`
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    id: id,
    style: dotDurationStyle
  }, /*#__PURE__*/React.createElement(_reactSlick.default, {
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
var _default = exports.default = Carousel;