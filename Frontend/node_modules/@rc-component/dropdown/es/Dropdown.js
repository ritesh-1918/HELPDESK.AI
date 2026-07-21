function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import Trigger from '@rc-component/trigger';
import { composeRef, getNodeRef, supportRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import React from 'react';
import useAccessibility from "./hooks/useAccessibility";
import Overlay from "./Overlay";
import Placements from "./placements";
const Dropdown = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    arrow = false,
    prefixCls = 'rc-dropdown',
    transitionName,
    animation,
    align,
    placement = 'bottomLeft',
    placements = Placements,
    getPopupContainer,
    showAction,
    hideAction,
    overlayClassName,
    overlayStyle,
    visible,
    trigger = ['hover'],
    autoFocus,
    overlay,
    children,
    onVisibleChange,
    ...otherProps
  } = props;
  const [triggerVisible, setTriggerVisible] = React.useState();
  const mergedVisible = 'visible' in props ? visible : triggerVisible;
  const mergedMotionName = animation ? `${prefixCls}-${animation}` : transitionName;
  const triggerRef = React.useRef(null);
  const overlayRef = React.useRef(null);
  const childRef = React.useRef(null);
  React.useImperativeHandle(ref, () => triggerRef.current);
  const handleVisibleChange = newVisible => {
    setTriggerVisible(newVisible);
    onVisibleChange?.(newVisible);
  };
  useAccessibility({
    visible: mergedVisible,
    triggerRef: childRef,
    onVisibleChange: handleVisibleChange,
    autoFocus,
    overlayRef
  });
  const onClick = e => {
    const {
      onOverlayClick
    } = props;
    setTriggerVisible(false);
    if (onOverlayClick) {
      onOverlayClick(e);
    }
  };
  const getMenuElement = () => /*#__PURE__*/React.createElement(Overlay, {
    ref: overlayRef,
    overlay: overlay,
    prefixCls: prefixCls,
    arrow: arrow
  });
  const getMenuElementOrLambda = () => {
    if (typeof overlay === 'function') {
      return getMenuElement;
    }
    return getMenuElement();
  };
  const getMinOverlayWidthMatchTrigger = () => {
    const {
      minOverlayWidthMatchTrigger,
      alignPoint
    } = props;
    if ('minOverlayWidthMatchTrigger' in props) {
      return minOverlayWidthMatchTrigger;
    }
    return !alignPoint;
  };
  const getOpenClassName = () => {
    const {
      openClassName
    } = props;
    if (openClassName !== undefined) {
      return openClassName;
    }
    return `${prefixCls}-open`;
  };
  const childrenNode = /*#__PURE__*/React.cloneElement(children, {
    className: clsx(children.props?.className, mergedVisible && getOpenClassName()),
    ref: supportRef(children) ? composeRef(childRef, getNodeRef(children)) : undefined
  });
  let triggerHideAction = hideAction;
  if (!triggerHideAction && trigger.indexOf('contextMenu') !== -1) {
    triggerHideAction = ['click'];
  }
  return /*#__PURE__*/React.createElement(Trigger, _extends({
    builtinPlacements: placements
  }, otherProps, {
    prefixCls: prefixCls,
    ref: triggerRef,
    popupClassName: clsx(overlayClassName, {
      [`${prefixCls}-show-arrow`]: arrow
    }),
    popupStyle: overlayStyle,
    action: trigger,
    showAction: showAction,
    hideAction: triggerHideAction,
    popupPlacement: placement,
    popupAlign: align,
    popupMotion: {
      motionName: mergedMotionName
    },
    popupVisible: mergedVisible,
    stretch: getMinOverlayWidthMatchTrigger() ? 'minWidth' : '',
    popup: getMenuElementOrLambda(),
    onOpenChange: handleVisibleChange,
    onPopupClick: onClick,
    getPopupContainer: getPopupContainer
  }), childrenNode);
});
export default Dropdown;