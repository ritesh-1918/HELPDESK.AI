"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var React = _interopRequireWildcard(require("react"));
var _context = _interopRequireDefault(require("./context"));
var _DrawerPanel = _interopRequireDefault(require("./DrawerPanel"));
var _useDrag = _interopRequireDefault(require("./hooks/useDrag"));
var _util = require("./util");
var _util2 = require("@rc-component/util");
var _useFocusable = _interopRequireDefault(require("./hooks/useFocusable"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
  const ignoreElement = (0, _useFocusable.default)(() => panelRef.current, open, autoFocus, focusTrap, mask);

  // ============================ Push ============================
  const [pushed, setPushed] = React.useState(false);
  const parentContext = React.useContext(_context.default);

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
  const maskNode = /*#__PURE__*/React.createElement(_motion.default, _extends({
    key: "mask"
  }, maskMotion, {
    visible: mask && open
  }), ({
    className: motionMaskClassName,
    style: motionMaskStyle
  }, maskRef) => /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-mask`, motionMaskClassName, drawerClassNames?.mask, maskClassName),
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
    return (0, _util.parseWidthHeight)(nextMergedSize);
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
      nextWrapperStyle.width = (0, _util.parseWidthHeight)(mergedSize);
    } else {
      nextWrapperStyle.height = (0, _util.parseWidthHeight)(mergedSize);
    }
    return nextWrapperStyle;
  }, [pushed, pushDistance, placement, isHorizontal, mergedSize]);

  // =========================== Resize ===========================
  const wrapperRef = React.useRef(null);
  const isResizable = !!resizable;
  const resizeConfig = typeof resizable === 'object' && resizable || {};
  const onInternalResize = (0, _util2.useEvent)(size => {
    setCurrentSize(size);
    resizeConfig.onResize?.(size);
  });
  const {
    dragElementProps,
    isDragging
  } = (0, _useDrag.default)({
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
  const panelNode = /*#__PURE__*/React.createElement(_motion.default, _extends({
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
    const content = /*#__PURE__*/React.createElement(_DrawerPanel.default, _extends({
      id: id,
      containerRef: motionRef,
      prefixCls: prefixCls,
      className: (0, _clsx.clsx)(className, drawerClassNames?.section),
      style: {
        ...style,
        ...styles?.section
      }
    }, (0, _pickAttrs.default)(props, {
      aria: true
    }), eventHandlers), children);
    return /*#__PURE__*/React.createElement("div", _extends({
      ref: wrapperRef,
      className: (0, _clsx.clsx)(`${prefixCls}-content-wrapper`, isDragging && `${prefixCls}-content-wrapper-dragging`, drawerClassNames?.wrapper, !isDragging && motionClassName),
      style: {
        ...motionStyle,
        ...wrapperStyle,
        ...styles?.wrapper
      }
    }, (0, _pickAttrs.default)(props, {
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
  return /*#__PURE__*/React.createElement(_context.default.Provider, {
    value: mergedContext
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(prefixCls, `${prefixCls}-${placement}`, rootClassName, {
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
var _default = exports.default = RefDrawerPopup;