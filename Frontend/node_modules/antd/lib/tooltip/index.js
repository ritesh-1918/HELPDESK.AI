"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _tooltip = _interopRequireDefault(require("@rc-component/tooltip"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _hooks = require("../_util/hooks");
var _motion = require("../_util/motion");
var _placements = _interopRequireDefault(require("../_util/placements"));
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _zindexContext = _interopRequireDefault(require("../_util/zindexContext"));
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _internal = require("../theme/internal");
var _useMergedArrow = _interopRequireDefault(require("./hook/useMergedArrow"));
var _PurePanel = _interopRequireDefault(require("./PurePanel"));
var _style = _interopRequireDefault(require("./style"));
var _UniqueProvider = _interopRequireDefault(require("./UniqueProvider"));
var _util2 = require("./util");
const InternalTooltip = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    openClassName,
    getTooltipContainer,
    color,
    children,
    afterOpenChange,
    arrow: tooltipArrow,
    destroyTooltipOnHide,
    destroyOnHidden,
    title,
    overlay,
    trigger,
    builtinPlacements,
    autoAdjustOverflow = true,
    motion,
    getPopupContainer,
    placement = 'top',
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    rootClassName,
    styles,
    classNames,
    onOpenChange,
    // Legacy
    overlayInnerStyle,
    overlayStyle,
    overlayClassName,
    ...restProps
  } = props;
  const [, token] = (0, _internal.useToken)();
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    arrow: contextArrow,
    trigger: contextTrigger
  } = (0, _context.useComponentConfig)('tooltip');
  const mergedArrow = (0, _useMergedArrow.default)(tooltipArrow, contextArrow);
  const mergedShowArrow = mergedArrow.show;
  const mergedTrigger = trigger || contextTrigger || 'hover';
  // ============================== Ref ===============================
  const warning = (0, _warning.devUseWarning)('Tooltip');
  const tooltipRef = React.useRef(null);
  const forceAlign = () => {
    tooltipRef.current?.forceAlign();
  };
  React.useImperativeHandle(ref, () => ({
    forceAlign,
    nativeElement: tooltipRef.current?.nativeElement,
    popupElement: tooltipRef.current?.popupElement
  }));
  // ============================== Warn ==============================
  if (process.env.NODE_ENV !== 'production') {
    [['overlayStyle', 'styles.root'], ['overlayInnerStyle', 'styles.container'], ['overlayClassName', 'classNames.root'], ['destroyTooltipOnHide', 'destroyOnHidden']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    process.env.NODE_ENV !== "production" ? warning(!destroyTooltipOnHide || typeof destroyTooltipOnHide === 'boolean', 'usage', '`destroyTooltipOnHide` no need config `keepParent` anymore. Please use `boolean` value directly.') : void 0;
  }
  // ============================== Open ==============================
  const [open, setOpen] = (0, _util.useControlledState)(props.defaultOpen ?? false, props.open);
  const noTitle = !title && !overlay && title !== 0; // overlay for old version compatibility
  const onInternalOpenChange = vis => {
    setOpen(noTitle ? false : vis);
    if (!noTitle && onOpenChange) {
      onOpenChange(vis);
    }
  };
  const tooltipPlacements = React.useMemo(() => {
    return builtinPlacements || (0, _placements.default)({
      arrowPointAtCenter: mergedArrow?.pointAtCenter ?? false,
      autoAdjustOverflow,
      arrowWidth: mergedShowArrow ? token.sizePopupArrow : 0,
      borderRadius: token.borderRadius,
      offset: token.marginXXS,
      visibleFirst: true
    });
  }, [mergedArrow, builtinPlacements, token, mergedShowArrow, autoAdjustOverflow]);
  const memoOverlay = React.useMemo(() => {
    if (title === 0) {
      return title;
    }
    return overlay || title || '';
  }, [overlay, title]);
  const memoOverlayWrapper = /*#__PURE__*/React.createElement(_ContextIsolator.default, {
    space: true,
    form: true
  }, typeof memoOverlay === 'function' ? memoOverlay() : memoOverlay);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    trigger: mergedTrigger,
    color,
    placement,
    builtinPlacements,
    openClassName,
    arrow: tooltipArrow,
    autoAdjustOverflow,
    getPopupContainer,
    children,
    destroyTooltipOnHide,
    destroyOnHidden
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const injectFromPopover = props['data-popover-inject'];
  let tempOpen = open;
  // Hide tooltip when there is no title
  if (!('open' in props) && noTitle) {
    tempOpen = false;
  }
  // ============================= Render =============================
  const child = /*#__PURE__*/React.isValidElement(children) && !(0, _reactNode.isFragment)(children) ? children : /*#__PURE__*/React.createElement("span", null, children);
  const childProps = child.props;
  const childCls = !childProps.className || typeof childProps.className === 'string' ? (0, _clsx.clsx)(childProps.className, openClassName || `${prefixCls}-open`) : childProps.className;
  // Style
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls, !injectFromPopover);
  // Color
  const colorInfo = (0, _util2.parseColor)(rootPrefixCls, prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const themeCls = (0, _clsx.clsx)(rootCls, hashId, cssVarCls);
  const rootClassNames = (0, _clsx.clsx)(overlayClassName, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, colorInfo.className, rootClassName, themeCls, contextClassName, mergedClassNames.root);
  // ============================ zIndex ============================
  const [zIndex, contextZIndex] = (0, _hooks.useZIndex)('Tooltip', restProps.zIndex);
  const containerStyle = {
    ...mergedStyles.container,
    ...overlayInnerStyle,
    ...colorInfo.overlayStyle
  };
  const content = /*#__PURE__*/React.createElement(_tooltip.default, {
    unique: true,
    ...restProps,
    trigger: mergedTrigger,
    zIndex: zIndex,
    showArrow: mergedShowArrow,
    placement: placement,
    mouseEnterDelay: mouseEnterDelay,
    mouseLeaveDelay: mouseLeaveDelay,
    prefixCls: prefixCls,
    classNames: {
      root: rootClassNames,
      container: mergedClassNames.container,
      arrow: mergedClassNames.arrow,
      uniqueContainer: (0, _clsx.clsx)(themeCls, mergedClassNames.container)
    },
    styles: {
      root: {
        ...arrowContentStyle,
        ...mergedStyles.root,
        ...contextStyle,
        ...overlayStyle
      },
      container: containerStyle,
      uniqueContainer: containerStyle,
      arrow: mergedStyles.arrow
    },
    getTooltipContainer: getPopupContainer || getTooltipContainer || getContextPopupContainer,
    ref: tooltipRef,
    builtinPlacements: tooltipPlacements,
    overlay: memoOverlayWrapper,
    visible: tempOpen,
    onVisibleChange: onInternalOpenChange,
    afterVisibleChange: afterOpenChange,
    arrowContent: /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-arrow-content`
    }),
    motion: {
      motionName: (0, _motion.getTransitionName)(rootPrefixCls, 'zoom-big-fast', typeof motion?.motionName === 'string' ? motion?.motionName : undefined),
      motionDeadline: 1000
    },
    destroyOnHidden: destroyOnHidden ?? !!destroyTooltipOnHide
  }, tempOpen ? (0, _reactNode.cloneElement)(child, {
    className: childCls
  }) : child);
  return /*#__PURE__*/React.createElement(_zindexContext.default.Provider, {
    value: contextZIndex
  }, content);
});
const Tooltip = InternalTooltip;
if (process.env.NODE_ENV !== 'production') {
  Tooltip.displayName = 'Tooltip';
}
Tooltip._InternalPanelDoNotUseOrYouWillBeFired = _PurePanel.default;
Tooltip.UniqueProvider = _UniqueProvider.default;
var _default = exports.default = Tooltip;