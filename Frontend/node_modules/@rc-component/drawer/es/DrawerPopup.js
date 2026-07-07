function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import * as React from 'react';
import DrawerContext from "./context";
import DrawerPanel from "./DrawerPanel";
import useDrag from "./hooks/useDrag";
import { parseWidthHeight } from "./util";
import { useEvent } from '@rc-component/util';
import useFocusable from "./hooks/useFocusable";
const DrawerPopup = (props, ref) => {
  const {
    prefixCls,
    open,
    placement,
    inline,
    push,
    forceRender,
    // Focus
    autoFocus,
    focusTrap,
    // classNames
    classNames: drawerClassNames,
    // Root
    rootClassName,
    rootStyle,
    zIndex,
    // Drawer
    className,
    id,
    style,
    motion,
    width,
    height,
    size,
    maxSize,
    children,
    // Mask
    mask,
    maskClosable,
    maskMotion,
    maskClassName,
    maskStyle,
    // Events
    afterOpenChange,
    onClose,
    onMouseEnter,
    onMouseOver,
    onMouseLeave,
    onClick,
    onKeyDown,
    onKeyUp,
    styles,
    drawerRender,
    resizable,
    defaultSize
  } = props;

  // ================================ Refs ================================
  const panelRef = React.useRef(null);
  React.useImperativeHandle(ref, () => panelRef.current);

  // ========================= Focusable ==========================
  const ignoreElement = useFocusable(() => panelRef.current, open, autoFocus, focusTrap, mask);

  // ============================ Push ============================
  const [pushed, setPushed] = React.useState(false);
  const parentContext = React.useContext(DrawerContext);

  // Merge push distance
  let pushConfig;
  if (typeof push === 'boolean') {
    pushConfig = push ? {} : {
      distance: 0
    };
  } else {
    pushConfig = push || {};
  }
  const pushDistance = pushConfig?.distance ?? parentContext?.pushDistance ?? 180;
  const mergedContext = React.useMemo(() => ({
    pushDistance,
    push: () => {
      setPushed(true);
    },
    pull: () => {
      setPushed(false);
    }
  }), [pushDistance]);

  // ========================= ScrollLock =========================
  // Tell parent to push
  React.useEffect(() => {
    if (open) {
      parentContext?.push?.();
    } else {
      parentContext?.pull?.();
    }
  }, [open]);

  // Clean up
  React.useEffect(() => () => {
    parentContext?.pull?.();
  }, []);

  // ============================ Mask ============================
  const maskNode = /*#__PURE__*/React.createElement(CSSMotion, _extends({
    key: "mask"
  }, maskMotion, {
    visible: mask && open
  }), ({
    className: motionMaskClassName,
    style: motionMaskStyle
  }, maskRef) => /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-mask`, motionMaskClassName, drawerClassNames?.mask, maskClassName),
    style: {
      ...motionMaskStyle,
      ...maskStyle,
      ...styles?.mask
    },
    onClick: maskClosable && open ? onClose : undefined,
    ref: maskRef
  }));

  // =========================== Panel ============================
  const motionProps = typeof motion === 'function' ? motion(placement) : motion;

  // ============================ Size ============================
  const [currentSize, setCurrentSize] = React.useState();
  const isHorizontal = placement === 'left' || placement === 'right';

  // Aggregate size logic with backward compatibility using useMemo
  const mergedSize = React.useMemo(() => {
    const legacySize = isHorizontal ? width : height;
    const nextMergedSize = size ?? legacySize ?? currentSize ?? defaultSize ?? (isHorizontal ? 378 : undefined);
    return parseWidthHeight(nextMergedSize);
  }, [size, width, height, defaultSize, isHorizontal, currentSize]);

  // >>> Style
  const wrapperStyle = React.useMemo(() => {
    const nextWrapperStyle = {};
    if (pushed && pushDistance) {
      switch (placement) {
        case 'top':
          nextWrapperStyle.transform = `translateY(${pushDistance}px)`;
          break;
        case 'bottom':
          nextWrapperStyle.transform = `translateY(${-pushDistance}px)`;
          break;
        case 'left':
          nextWrapperStyle.transform = `translateX(${pushDistance}px)`;
          break;
        default:
          nextWrapperStyle.transform = `translateX(${-pushDistance}px)`;
          break;
      }
    }
    if (isHorizontal) {
      nextWrapperStyle.width = parseWidthHeight(mergedSize);
    } else {
      nextWrapperStyle.height = parseWidthHeight(mergedSize);
    }
    return nextWrapperStyle;
  }, [pushed, pushDistance, placement, isHorizontal, mergedSize]);

  // =========================== Resize ===========================
  const wrapperRef = React.useRef(null);
  const isResizable = !!resizable;
  const resizeConfig = typeof resizable === 'object' && resizable || {};
  const onInternalResize = useEvent(size => {
    setCurrentSize(size);
    resizeConfig.onResize?.(size);
  });
  const {
    dragElementProps,
    isDragging
  } = useDrag({
    prefixCls: `${prefixCls}-resizable`,
    direction: placement,
    className: drawerClassNames?.dragger,
    style: styles?.dragger,
    maxSize,
    containerRef: wrapperRef,
    currentSize: mergedSize,
    onResize: onInternalResize,
    onResizeStart: resizeConfig.onResizeStart,
    onResizeEnd: resizeConfig.onResizeEnd
  });

  // =========================== Events ===========================
  const eventHandlers = {
    onMouseEnter,
    onMouseOver,
    onMouseLeave,
    onClick,
    onKeyDown,
    onKeyUp,
    onFocus: e => {
      ignoreElement(e.target);
    }
  };

  // =========================== Render ==========================
  // >>>>> Panel
  const panelNode = /*#__PURE__*/React.createElement(CSSMotion, _extends({
    key: "panel"
  }, motionProps, {
    visible: open,
    forceRender: forceRender,
    onVisibleChanged: afterOpenChange,
    removeOnLeave: false,
    leavedClassName: `${prefixCls}-content-wrapper-hidden`
  }), ({
    className: motionClassName,
    style: motionStyle
  }, motionRef) => {
    const content = /*#__PURE__*/React.createElement(DrawerPanel, _extends({
      id: id,
      containerRef: motionRef,
      prefixCls: prefixCls,
      className: clsx(className, drawerClassNames?.section),
      style: {
        ...style,
        ...styles?.section
      }
    }, pickAttrs(props, {
      aria: true
    }), eventHandlers), children);
    return /*#__PURE__*/React.createElement("div", _extends({
      ref: wrapperRef,
      className: clsx(`${prefixCls}-content-wrapper`, isDragging && `${prefixCls}-content-wrapper-dragging`, drawerClassNames?.wrapper, !isDragging && motionClassName),
      style: {
        ...motionStyle,
        ...wrapperStyle,
        ...styles?.wrapper
      }
    }, pickAttrs(props, {
      data: true
    })), isResizable && /*#__PURE__*/React.createElement("div", dragElementProps), drawerRender ? drawerRender(content) : content);
  });

  // >>>>> Container
  const containerStyle = {
    ...rootStyle
  };
  if (zIndex) {
    containerStyle.zIndex = zIndex;
  }
  return /*#__PURE__*/React.createElement(DrawerContext.Provider, {
    value: mergedContext
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(prefixCls, `${prefixCls}-${placement}`, rootClassName, {
      [`${prefixCls}-open`]: open,
      [`${prefixCls}-inline`]: inline
    }),
    style: containerStyle,
    tabIndex: -1,
    ref: panelRef
  }, maskNode, panelNode));
};
const RefDrawerPopup = /*#__PURE__*/React.forwardRef(DrawerPopup);
if (process.env.NODE_ENV !== 'production') {
  RefDrawerPopup.displayName = 'DrawerPopup';
}
export default RefDrawerPopup;