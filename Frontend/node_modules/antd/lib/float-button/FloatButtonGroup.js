"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _FileTextOutlined = _interopRequireDefault(require("@ant-design/icons/FileTextOutlined"));
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _flex = _interopRequireDefault(require("../flex"));
var _space = _interopRequireDefault(require("../space"));
var _context2 = require("./context");
var _FloatButton = _interopRequireWildcard(require("./FloatButton"));
var _style = _interopRequireDefault(require("./style"));
const FloatButtonGroup = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    classNames,
    styles,
    rootClassName,
    shape = 'circle',
    type = 'default',
    placement,
    icon = /*#__PURE__*/_react.default.createElement(_FileTextOutlined.default, null),
    closeIcon,
    trigger,
    children,
    onOpenChange,
    open: customOpen,
    onClick: onTriggerButtonClick,
    ...floatButtonProps
  } = props;
  const {
    direction,
    getPrefixCls,
    closeIcon: contextCloseIcon,
    classNames: contextClassNames,
    styles: contextStyles,
    className: contextClassName,
    style: contextStyle
  } = (0, _context.useComponentConfig)('floatButtonGroup');
  const mergedCloseIcon = closeIcon ?? contextCloseIcon ?? /*#__PURE__*/_react.default.createElement(_CloseOutlined.default, null);
  const prefixCls = getPrefixCls(_FloatButton.floatButtonPrefixCls, customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const isMenuMode = trigger && ['click', 'hover'].includes(trigger);
  // ============================ zIndex ============================
  const [zIndex] = (0, _hooks.useZIndex)('FloatButton', style?.zIndex);
  // ============================= Refs =============================
  const floatButtonGroupRef = _react.default.useRef(null);
  // ========================== Placement ==========================
  const mergedPlacement = ['top', 'left', 'right', 'bottom'].includes(placement) ? placement : 'top';
  // ========================== Open ==========================
  const [open, setOpen] = (0, _util.useControlledState)(false, customOpen);
  const hoverTrigger = trigger === 'hover';
  const clickTrigger = trigger === 'click';
  const triggerOpen = (0, _util.useEvent)(nextOpen => {
    if (open !== nextOpen) {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    }
  });
  // ===================== Trigger: Hover =====================
  const onMouseEnter = () => {
    if (hoverTrigger) {
      triggerOpen(true);
    }
  };
  const onMouseLeave = () => {
    if (hoverTrigger) {
      triggerOpen(false);
    }
  };
  // ===================== Trigger: Click =====================
  const onInternalTriggerButtonClick = e => {
    if (clickTrigger) {
      triggerOpen(!open);
    }
    onTriggerButtonClick?.(e);
  };
  _react.default.useEffect(() => {
    if (clickTrigger) {
      const onDocClick = e => {
        // Skip if click on the group
        if (floatButtonGroupRef.current?.contains(e.target)) {
          return;
        }
        triggerOpen(false);
      };
      document.addEventListener('click', onDocClick, {
        capture: true
      });
      return () => document.removeEventListener('click', onDocClick, {
        capture: true
      });
    }
  }, [clickTrigger]);
  // ======================== Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('FloatButton.Group');
    process.env.NODE_ENV !== "production" ? warning(!('open' in props) || !!trigger, 'usage', '`open` need to be used together with `trigger`') : void 0;
  }
  // ======================== Contexts ========================
  const individual = shape === 'circle';
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    shape,
    type,
    placement: mergedPlacement
  };
  // ============================ Styles ============================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const listContext = _react.default.useMemo(() => ({
    shape,
    individual,
    classNames: {
      root: mergedClassNames.item,
      icon: mergedClassNames.itemIcon,
      content: mergedClassNames.itemContent
    },
    styles: {
      root: mergedStyles.item,
      icon: mergedStyles.itemIcon,
      content: mergedStyles.itemContent
    }
  }), [shape, individual, mergedClassNames, mergedStyles]);
  const triggerContext = _react.default.useMemo(() => ({
    ...listContext,
    individual: true,
    classNames: {
      root: mergedClassNames.trigger,
      icon: mergedClassNames.triggerIcon,
      content: mergedClassNames.triggerContent
    },
    styles: {
      root: mergedStyles.trigger,
      icon: mergedStyles.triggerIcon,
      content: mergedStyles.triggerContent
    }
  }), [listContext, mergedClassNames, mergedStyles]);
  // ========================= Render =========================
  // >>> List
  let listNode;
  const listCls = `${groupPrefixCls}-list`;
  const renderList = motionClassName => {
    const vertical = mergedPlacement === 'top' || mergedPlacement === 'bottom';
    const sharedProps = {
      className: (0, _clsx.clsx)(listCls, mergedClassNames.list, motionClassName),
      style: mergedStyles.list
    };
    if (individual) {
      listNode = /*#__PURE__*/_react.default.createElement(_flex.default, {
        vertical: vertical,
        ...sharedProps
      }, children);
    } else {
      listNode = /*#__PURE__*/_react.default.createElement(_space.default.Compact, {
        vertical: vertical,
        ...sharedProps
      }, children);
    }
    return listNode;
  };
  // >>> Render
  return /*#__PURE__*/_react.default.createElement(_context2.GroupContext.Provider, {
    value: listContext
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(groupPrefixCls, hashId, cssVarCls, rootCls, contextClassName, mergedClassNames.root, className, rootClassName, {
      [`${groupPrefixCls}-rtl`]: direction === 'rtl',
      [`${groupPrefixCls}-individual`]: individual,
      [`${groupPrefixCls}-${mergedPlacement}`]: isMenuMode,
      [`${groupPrefixCls}-menu-mode`]: isMenuMode
    }),
    style: {
      ...contextStyle,
      zIndex,
      ...mergedStyles.root,
      ...style
    },
    // ref
    ref: floatButtonGroupRef,
    // Hover trigger
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave
  }, isMenuMode ? (/*#__PURE__*/_react.default.createElement(_motion.default, {
    visible: open,
    motionName: `${listCls}-motion`
  }, ({
    className: motionClassName
  }) => renderList(motionClassName))) : renderList(), isMenuMode && (/*#__PURE__*/_react.default.createElement(_context2.GroupContext.Provider, {
    value: triggerContext
  }, /*#__PURE__*/_react.default.createElement(_FloatButton.default, {
    type: type,
    icon: open ? mergedCloseIcon : icon,
    "aria-label": props['aria-label'],
    className: `${groupPrefixCls}-trigger`,
    onClick: onInternalTriggerButtonClick,
    ...floatButtonProps
  })))));
};
var _default = exports.default = FloatButtonGroup;