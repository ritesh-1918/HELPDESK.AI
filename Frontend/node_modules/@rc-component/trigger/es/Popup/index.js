function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import ResizeObserver from '@rc-component/resize-observer';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import { composeRef } from "@rc-component/util/es/ref";
import * as React from 'react';
import Arrow from "./Arrow";
import Mask from "./Mask";
import PopupContent from "./PopupContent";
import useOffsetStyle from "../hooks/useOffsetStyle";
import { useEvent } from '@rc-component/util';
const Popup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    onEsc,
    popup,
    className,
    prefixCls,
    style,
    target,
    onVisibleChanged,
    // Open
    open,
    keepDom,
    fresh,
    // Click
    onClick,
    // Mask
    mask,
    // Arrow
    arrow,
    arrowPos,
    align,
    // Motion
    motion,
    maskMotion,
    // Mobile
    mobile,
    // Portal
    forceRender,
    getPopupContainer,
    autoDestroy,
    portal: Portal,
    children,
    zIndex,
    onMouseEnter,
    onMouseLeave,
    onPointerEnter,
    onPointerDownCapture,
    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    onAlign,
    onPrepare,
    // Resize
    onResize,
    stretch,
    targetWidth,
    targetHeight
  } = props;
  const popupContent = typeof popup === 'function' ? popup() : popup;

  // We can not remove holder only when motion finished.
  const isNodeVisible = open || keepDom;

  // ========================= Mobile =========================
  const isMobile = !!mobile;

  // ========================== Mask ==========================
  const [mergedMask, mergedMaskMotion, mergedPopupMotion] = React.useMemo(() => {
    if (mobile) {
      return [mobile.mask, mobile.maskMotion, mobile.motion];
    }
    return [mask, maskMotion, motion];
  }, [mobile, mask, maskMotion, motion]);

  // ======================= Container ========================
  const getPopupContainerNeedParams = getPopupContainer?.length > 0;
  const [show, setShow] = React.useState(!getPopupContainer || !getPopupContainerNeedParams);

  // Delay to show since `getPopupContainer` need target element
  useLayoutEffect(() => {
    if (!show && getPopupContainerNeedParams && target) {
      setShow(true);
    }
  }, [show, getPopupContainerNeedParams, target]);

  // ========================= Resize =========================
  const onInternalResize = useEvent((size, ele) => {
    onResize?.(size, ele);
    onAlign();
  });

  // ========================= Styles =========================
  const offsetStyle = useOffsetStyle(isMobile, ready, open, align, offsetR, offsetB, offsetX, offsetY);

  // ========================= Render =========================
  if (!show) {
    return null;
  }

  // >>>>> Misc
  const miscStyle = {};
  if (stretch) {
    if (stretch.includes('height') && targetHeight) {
      miscStyle.height = targetHeight;
    } else if (stretch.includes('minHeight') && targetHeight) {
      miscStyle.minHeight = targetHeight;
    }
    if (stretch.includes('width') && targetWidth) {
      miscStyle.width = targetWidth;
    } else if (stretch.includes('minWidth') && targetWidth) {
      miscStyle.minWidth = targetWidth;
    }
  }
  if (!open) {
    miscStyle.pointerEvents = 'none';
  }
  return /*#__PURE__*/React.createElement(Portal, {
    open: forceRender || isNodeVisible,
    getContainer: getPopupContainer && (() => getPopupContainer(target)),
    autoDestroy: autoDestroy,
    onEsc: onEsc
  }, /*#__PURE__*/React.createElement(Mask, {
    prefixCls: prefixCls,
    open: open,
    zIndex: zIndex,
    mask: mergedMask,
    motion: mergedMaskMotion,
    mobile: isMobile
  }), /*#__PURE__*/React.createElement(ResizeObserver, {
    onResize: onInternalResize,
    disabled: !open
  }, resizeObserverRef => {
    return /*#__PURE__*/React.createElement(CSSMotion, _extends({
      motionAppear: true,
      motionEnter: true,
      motionLeave: true,
      removeOnLeave: false,
      forceRender: forceRender,
      leavedClassName: `${prefixCls}-hidden`
    }, mergedPopupMotion, {
      onAppearPrepare: onPrepare,
      onEnterPrepare: onPrepare,
      visible: open,
      onVisibleChanged: nextVisible => {
        motion?.onVisibleChanged?.(nextVisible);
        onVisibleChanged(nextVisible);
      }
    }), ({
      className: motionClassName,
      style: motionStyle
    }, motionRef) => {
      const cls = clsx(prefixCls, motionClassName, className, {
        [`${prefixCls}-mobile`]: isMobile
      });
      return /*#__PURE__*/React.createElement("div", {
        ref: composeRef(resizeObserverRef, ref, motionRef),
        className: cls,
        style: {
          '--arrow-x': `${arrowPos.x || 0}px`,
          '--arrow-y': `${arrowPos.y || 0}px`,
          ...offsetStyle,
          ...miscStyle,
          ...motionStyle,
          boxSizing: 'border-box',
          zIndex,
          ...style
        },
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onPointerEnter: onPointerEnter,
        onClick: onClick,
        onPointerDownCapture: onPointerDownCapture
      }, arrow && /*#__PURE__*/React.createElement(Arrow, {
        prefixCls: prefixCls,
        arrow: arrow,
        arrowPos: arrowPos,
        align: align
      }), /*#__PURE__*/React.createElement(PopupContent, {
        cache: !open && !fresh
      }, popupContent));
    });
  }), children);
});
if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}
export default Popup;