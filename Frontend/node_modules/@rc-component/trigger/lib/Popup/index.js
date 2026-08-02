"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _ref = require("@rc-component/util/lib/ref");
var React = _interopRequireWildcard(require("react"));
var _Arrow = _interopRequireDefault(require("./Arrow"));
var _Mask = _interopRequireDefault(require("./Mask"));
var _PopupContent = _interopRequireDefault(require("./PopupContent"));
var _useOffsetStyle = _interopRequireDefault(require("../hooks/useOffsetStyle"));
var _util = require("@rc-component/util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
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
  (0, _useLayoutEffect.default)(() => {
    if (!show && getPopupContainerNeedParams && target) {
      setShow(true);
    }
  }, [show, getPopupContainerNeedParams, target]);

  // ========================= Resize =========================
  const onInternalResize = (0, _util.useEvent)((size, ele) => {
    onResize?.(size, ele);
    onAlign();
  });

  // ========================= Styles =========================
  const offsetStyle = (0, _useOffsetStyle.default)(isMobile, ready, open, align, offsetR, offsetB, offsetX, offsetY);

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
  }, /*#__PURE__*/React.createElement(_Mask.default, {
    prefixCls: prefixCls,
    open: open,
    zIndex: zIndex,
    mask: mergedMask,
    motion: mergedMaskMotion,
    mobile: isMobile
  }), /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onInternalResize,
    disabled: !open
  }, resizeObserverRef => {
    return /*#__PURE__*/React.createElement(_motion.default, _extends({
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
      const cls = (0, _clsx.clsx)(prefixCls, motionClassName, className, {
        [`${prefixCls}-mobile`]: isMobile
      });
      return /*#__PURE__*/React.createElement("div", {
        ref: (0, _ref.composeRef)(resizeObserverRef, ref, motionRef),
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
      }, arrow && /*#__PURE__*/React.createElement(_Arrow.default, {
        prefixCls: prefixCls,
        arrow: arrow,
        arrowPos: arrowPos,
        align: align
      }), /*#__PURE__*/React.createElement(_PopupContent.default, {
        cache: !open && !fresh
      }, popupContent));
    });
  }), children);
});
if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}
var _default = exports.default = Popup;