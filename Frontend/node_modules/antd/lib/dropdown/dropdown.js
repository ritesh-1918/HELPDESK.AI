"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _dropdown = _interopRequireDefault(require("@rc-component/dropdown"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isPrimitive = _interopRequireDefault(require("../_util/isPrimitive"));
var _placements = _interopRequireDefault(require("../_util/placements"));
var _PurePanel = _interopRequireDefault(require("../_util/PurePanel"));
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _zindexContext = _interopRequireDefault(require("../_util/zindexContext"));
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _menu = _interopRequireDefault(require("../menu"));
var _OverrideContext = require("../menu/OverrideContext");
var _internal = require("../theme/internal");
var _style = _interopRequireDefault(require("./style"));
const _Placements = ['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight', 'top', 'bottom'];
const Dropdown = props => {
  const {
    menu,
    arrow,
    prefixCls: customizePrefixCls,
    children,
    trigger,
    disabled,
    dropdownRender,
    popupRender,
    getPopupContainer,
    overlayClassName,
    rootClassName,
    overlayStyle,
    open,
    onOpenChange,
    mouseEnterDelay = 0.15,
    mouseLeaveDelay = 0.1,
    autoAdjustOverflow = true,
    placement = '',
    transitionName,
    classNames,
    styles,
    destroyPopupOnHide,
    destroyOnHidden
  } = props;
  const {
    getPrefixCls,
    direction,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('dropdown');
  const mergedProps = {
    ...props,
    mouseEnterDelay,
    mouseLeaveDelay,
    autoAdjustOverflow
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const mergedRootStyles = {
    ...contextStyle,
    ...overlayStyle,
    ...mergedStyles.root
  };
  const mergedPopupRender = popupRender || dropdownRender;
  // =================== Warning =====================
  const warning = (0, _warning.devUseWarning)('Dropdown');
  if (process.env.NODE_ENV !== 'production') {
    const deprecatedProps = {
      dropdownRender: 'popupRender',
      destroyPopupOnHide: 'destroyOnHidden',
      overlayClassName: 'classNames.root',
      overlayStyle: 'styles.root'
    };
    Object.entries(deprecatedProps).forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    if (placement.includes('Center')) {
      warning.deprecated(!placement.includes('Center'), `placement: ${placement}`, `placement: ${placement.slice(0, placement.indexOf('Center'))}`);
    }
  }
  const memoTransitionName = React.useMemo(() => {
    const rootPrefixCls = getPrefixCls();
    if (transitionName !== undefined) {
      return transitionName;
    }
    if (placement.includes('top')) {
      return `${rootPrefixCls}-slide-down`;
    }
    return `${rootPrefixCls}-slide-up`;
  }, [getPrefixCls, placement, transitionName]);
  const memoPlacement = React.useMemo(() => {
    if (!placement) {
      return direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
    }
    if (placement.includes('Center')) {
      return placement.slice(0, placement.indexOf('Center'));
    }
    return placement;
  }, [placement, direction]);
  const prefixCls = getPrefixCls('dropdown', customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const [, token] = (0, _internal.useToken)();
  const child = React.Children.only((0, _isPrimitive.default)(children) ? /*#__PURE__*/React.createElement("span", null, children) : children);
  const popupTrigger = (0, _reactNode.cloneElement)(child, {
    className: (0, _clsx.clsx)(`${prefixCls}-trigger`, {
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, child.props.className),
    disabled: child.props.disabled ?? disabled
  });
  const triggerActions = disabled ? [] : trigger;
  const alignPoint = !!triggerActions?.includes('contextMenu');
  // =========================== Open ============================
  const [mergedOpen, setOpen] = (0, _util.useControlledState)(false, open);
  const onInnerOpenChange = (0, _util.useEvent)(nextOpen => {
    onOpenChange?.(nextOpen, {
      source: 'trigger'
    });
    setOpen(nextOpen);
  });
  // =========================== Overlay ============================
  const overlayClassNameCustomized = (0, _clsx.clsx)(overlayClassName, rootClassName, hashId, cssVarCls, rootCls, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  });
  const builtinPlacements = (0, _placements.default)({
    arrowPointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter,
    autoAdjustOverflow,
    offset: token.marginXXS,
    arrowWidth: arrow ? token.sizePopupArrow : 0,
    borderRadius: token.borderRadius
  });
  const onMenuClick = (0, _util.useEvent)(() => {
    if (menu?.selectable && menu?.multiple) {
      return;
    }
    onOpenChange?.(false, {
      source: 'menu'
    });
    setOpen(false);
  });
  const renderOverlay = () => {
    // @rc-component/dropdown already can process the function of overlay, but we have check logic here.
    // So we need render the element to check and pass back to @rc-component/dropdown.
    const menuClassNames = (0, _util.omit)(mergedClassNames, ['root']);
    const menuStyles = (0, _util.omit)(mergedStyles, ['root']);
    let overlayNode;
    if (menu?.items) {
      overlayNode = /*#__PURE__*/React.createElement(_menu.default, {
        ...menu,
        classNames: {
          ...menuClassNames,
          subMenu: {
            ...menuClassNames
          }
        },
        styles: {
          ...menuStyles,
          subMenu: {
            ...menuStyles
          }
        }
      });
    }
    if (mergedPopupRender) {
      overlayNode = mergedPopupRender(overlayNode);
    }
    overlayNode = React.Children.only(typeof overlayNode === 'string' ? /*#__PURE__*/React.createElement("span", null, overlayNode) : overlayNode);
    return /*#__PURE__*/React.createElement(_OverrideContext.OverrideProvider, {
      prefixCls: `${prefixCls}-menu`,
      rootClassName: (0, _clsx.clsx)(cssVarCls, rootCls),
      expandIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-menu-submenu-arrow`
      }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(_LeftOutlined.default, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      })) : (/*#__PURE__*/React.createElement(_RightOutlined.default, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      }))),
      mode: "vertical",
      selectable: false,
      onClick: onMenuClick,
      validator: ({
        mode
      }) => {
        // Warning if use other mode
        process.env.NODE_ENV !== "production" ? warning(!mode || mode === 'vertical', 'usage', `mode="${mode}" is not supported for Dropdown's Menu.`) : void 0;
      }
    }, overlayNode);
  };
  // =========================== zIndex ============================
  const [zIndex, contextZIndex] = (0, _hooks.useZIndex)('Dropdown', mergedRootStyles.zIndex);
  // ============================ Render ============================
  let renderNode = /*#__PURE__*/React.createElement(_dropdown.default, {
    alignPoint: alignPoint,
    ...(0, _util.omit)(props, ['rootClassName', 'onOpenChange']),
    mouseEnterDelay: mouseEnterDelay,
    mouseLeaveDelay: mouseLeaveDelay,
    visible: mergedOpen,
    builtinPlacements: builtinPlacements,
    arrow: !!arrow,
    overlayClassName: overlayClassNameCustomized,
    prefixCls: prefixCls,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    transitionName: memoTransitionName,
    trigger: triggerActions,
    overlay: renderOverlay,
    placement: memoPlacement,
    onVisibleChange: onInnerOpenChange,
    overlayStyle: {
      ...mergedRootStyles,
      zIndex
    },
    autoDestroy: destroyOnHidden ?? destroyPopupOnHide
  }, popupTrigger);
  if (zIndex) {
    renderNode = /*#__PURE__*/React.createElement(_zindexContext.default.Provider, {
      value: contextZIndex
    }, renderNode);
  }
  return renderNode;
};
// We don't care debug panel
const PurePanel = (0, _PurePanel.default)(Dropdown, 'align', undefined, 'dropdown', prefixCls => prefixCls);
/* istanbul ignore next */
const WrapPurePanel = props => (/*#__PURE__*/React.createElement(PurePanel, {
  ...props
}, /*#__PURE__*/React.createElement("span", null)));
Dropdown._InternalPanelDoNotUseOrYouWillBeFired = WrapPurePanel;
if (process.env.NODE_ENV !== 'production') {
  Dropdown.displayName = 'Dropdown';
}
var _default = exports.default = Dropdown;