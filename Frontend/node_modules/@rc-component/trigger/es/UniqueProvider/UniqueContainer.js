function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React from 'react';
import useOffsetStyle from "../hooks/useOffsetStyle";
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
const UniqueContainer = props => {
  const {
    prefixCls,
    isMobile,
    ready,
    open,
    align,
    offsetR,
    offsetB,
    offsetX,
    offsetY,
    arrowPos,
    popupSize,
    motion,
    uniqueContainerClassName,
    uniqueContainerStyle
  } = props;
  const containerCls = `${prefixCls}-unique-container`;
  const [motionVisible, setMotionVisible] = React.useState(false);

  // ========================= Styles =========================
  const offsetStyle = useOffsetStyle(isMobile, ready, open, align, offsetR, offsetB, offsetX, offsetY);

  // Cache for offsetStyle when ready is true
  const cachedOffsetStyleRef = React.useRef(offsetStyle);

  // Update cached offset style when ready is true
  if (ready) {
    cachedOffsetStyleRef.current = offsetStyle;
  }

  // Apply popup size if available
  const sizeStyle = {};
  if (popupSize) {
    sizeStyle.width = popupSize.width;
    sizeStyle.height = popupSize.height;
  }

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(CSSMotion, _extends({
    motionAppear: true,
    motionEnter: true,
    motionLeave: true,
    removeOnLeave: false,
    leavedClassName: `${containerCls}-hidden`
  }, motion, {
    visible: open,
    onVisibleChanged: nextVisible => {
      setMotionVisible(nextVisible);
    }
  }), ({
    className: motionClassName,
    style: motionStyle
  }) => {
    const cls = clsx(containerCls, motionClassName, uniqueContainerClassName, {
      [`${containerCls}-visible`]: motionVisible
    });
    return /*#__PURE__*/React.createElement("div", {
      className: cls,
      style: {
        '--arrow-x': `${arrowPos?.x || 0}px`,
        '--arrow-y': `${arrowPos?.y || 0}px`,
        ...cachedOffsetStyleRef.current,
        ...sizeStyle,
        ...motionStyle,
        ...uniqueContainerStyle
      }
    });
  });
};
export default UniqueContainer;