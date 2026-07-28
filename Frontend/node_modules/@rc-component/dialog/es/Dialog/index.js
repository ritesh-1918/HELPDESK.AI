function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import contains from "@rc-component/util/es/Dom/contains";
import useId from "@rc-component/util/es/hooks/useId";
import pickAttrs from "@rc-component/util/es/pickAttrs";
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { getMotionName } from "../util";
import Content from "./Content";
import Mask from "./Mask";
import { warning } from "@rc-component/util/es/warning";
const Dialog = props => {
  const {
    prefixCls = 'rc-dialog',
    zIndex,
    visible = false,
    focusTriggerAfterClose = true,
    wrapStyle,
    wrapClassName,
    wrapProps,
    onClose,
    afterOpenChange,
    afterClose,
    // Dialog
    transitionName,
    animation,
    closable = true,
    // Mask
    mask = true,
    maskTransitionName,
    maskAnimation,
    maskClosable = true,
    maskStyle,
    maskProps,
    rootClassName,
    rootStyle,
    classNames: modalClassNames,
    styles: modalStyles
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    ['wrapStyle', 'bodyStyle', 'maskStyle'].forEach(prop => {
      warning(!(prop in props), `${prop} is deprecated, please use styles instead.`);
    });
    if ('wrapClassName' in props) {
      warning(false, `wrapClassName is deprecated, please use classNames instead.`);
    }
  }
  const lastOutSideActiveElementRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [animatedVisible, setAnimatedVisible] = React.useState(visible);
  const [isFixedPos, setIsFixedPos] = React.useState(false);

  // ========================== Init ==========================
  const ariaId = useId();
  function saveLastOutSideActiveElementRef() {
    if (!contains(wrapperRef.current, document.activeElement)) {
      lastOutSideActiveElementRef.current = document.activeElement;
    }
  }
  function focusDialogContent() {
    if (!contains(wrapperRef.current, document.activeElement)) {
      contentRef.current?.focus();
    }
  }

  // ========================= Events =========================
  // Close action will trigger by:
  //   1. When hide motion end
  //   2. Controlled `open` to `false` immediately after set to `true` which will not trigger motion
  function doClose() {
    // Clean up scroll bar & focus back
    setAnimatedVisible(false);
    if (mask && lastOutSideActiveElementRef.current && focusTriggerAfterClose) {
      try {
        lastOutSideActiveElementRef.current.focus({
          preventScroll: true
        });
      } catch (e) {
        // Do nothing
      }
      lastOutSideActiveElementRef.current = null;
    }

    // Trigger afterClose only when change visible from true to false
    if (animatedVisible) {
      afterClose?.();
    }
  }
  function onDialogVisibleChanged(newVisible) {
    // Try to focus
    if (newVisible) {
      focusDialogContent();
    } else {
      doClose();
    }
    afterOpenChange?.(newVisible);
  }
  function onInternalClose(e) {
    onClose?.(e);
  }

  // >>> Content
  const mouseDownOnMaskRef = useRef(false);

  // >>> Wrapper
  // Close only when element not on dialog
  let onWrapperClick = null;
  if (maskClosable) {
    onWrapperClick = e => {
      if (wrapperRef.current === e.target && mouseDownOnMaskRef.current) {
        onInternalClose(e);
      }
    };
  }
  function onWrapperMouseDown(e) {
    mouseDownOnMaskRef.current = e.target === wrapperRef.current;
  }

  // ========================= Effect =========================
  useEffect(() => {
    if (visible) {
      mouseDownOnMaskRef.current = false;
      setAnimatedVisible(true);
      saveLastOutSideActiveElementRef();

      // Calc the position style
      if (wrapperRef.current) {
        const computedWrapStyle = getComputedStyle(wrapperRef.current);
        setIsFixedPos(computedWrapStyle.position === 'fixed');
      }
    } else if (animatedVisible && contentRef.current.enableMotion() && !contentRef.current.inMotion()) {
      doClose();
    }
  }, [visible]);
  const mergedStyle = {
    zIndex,
    ...wrapStyle,
    ...modalStyles?.wrapper,
    display: !animatedVisible ? 'none' : null
  };

  // ========================= Render =========================
  return /*#__PURE__*/React.createElement("div", _extends({
    className: clsx(`${prefixCls}-root`, rootClassName),
    style: rootStyle
  }, pickAttrs(props, {
    data: true
  })), /*#__PURE__*/React.createElement(Mask, {
    prefixCls: prefixCls,
    visible: mask && visible,
    motionName: getMotionName(prefixCls, maskTransitionName, maskAnimation),
    style: {
      zIndex,
      ...maskStyle,
      ...modalStyles?.mask
    },
    maskProps: maskProps,
    className: modalClassNames?.mask
  }), /*#__PURE__*/React.createElement("div", _extends({
    className: clsx(`${prefixCls}-wrap`, wrapClassName, modalClassNames?.wrapper),
    ref: wrapperRef,
    onClick: onWrapperClick,
    onMouseDown: onWrapperMouseDown,
    style: mergedStyle
  }, wrapProps), /*#__PURE__*/React.createElement(Content, _extends({}, props, {
    isFixedPos: isFixedPos,
    ref: contentRef,
    closable: closable,
    ariaId: ariaId,
    prefixCls: prefixCls,
    visible: visible && animatedVisible,
    onClose: onInternalClose,
    onVisibleChanged: onDialogVisibleChanged,
    motionName: getMotionName(prefixCls, transitionName, animation)
  }))));
};
export default Dialog;