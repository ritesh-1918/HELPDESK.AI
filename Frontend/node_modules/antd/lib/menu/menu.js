"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _EllipsisOutlined = _interopRequireDefault(require("@ant-design/icons/EllipsisOutlined"));
var _menu = _interopRequireDefault(require("@rc-component/menu"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _motion = _interopRequireDefault(require("../_util/motion"));
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _MenuContext = _interopRequireDefault(require("./MenuContext"));
var _MenuDivider = _interopRequireDefault(require("./MenuDivider"));
var _MenuItem = _interopRequireDefault(require("./MenuItem"));
var _OverrideContext = _interopRequireDefault(require("./OverrideContext"));
var _style = _interopRequireDefault(require("./style"));
var _SubMenu = _interopRequireDefault(require("./SubMenu"));
function isEmptyIcon(icon) {
  return icon === null || icon === false;
}
const MENU_COMPONENTS = {
  item: _MenuItem.default,
  submenu: _SubMenu.default,
  divider: _MenuDivider.default
};
const InternalMenu = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const override = React.useContext(_OverrideContext.default);
  const overrideObj = override || {};
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    theme = 'light',
    expandIcon,
    _internalDisableMenuItemTitleTooltip,
    tooltip,
    inlineCollapsed,
    siderCollapsed,
    rootClassName,
    mode,
    selectable,
    onClick,
    overflowedIndicatorPopupClassName,
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    menu
  } = React.useContext(_configProvider.ConfigContext);
  const {
    getPrefixCls,
    getPopupContainer,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('menu');
  const rootPrefixCls = getPrefixCls();
  const passedProps = (0, _util.omit)(restProps, ['collapsedWidth']);
  // ======================== Warning ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Menu');
    process.env.NODE_ENV !== "production" ? warning(!('inlineCollapsed' in props && mode !== 'inline'), 'usage', '`inlineCollapsed` should only be used when `mode` is inline.') : void 0;
    warning.deprecated('items' in props && !props.children, 'children', 'items');
  }
  overrideObj.validator?.({
    mode
  });
  // ========================== Click ==========================
  // Tell dropdown that item clicked
  const onItemClick = (0, _util.useEvent)((...args) => {
    onClick?.(...args);
    overrideObj.onClick?.();
  });
  // ========================== Mode ===========================
  const mergedMode = overrideObj.mode || mode;
  // ======================= Selectable ========================
  const mergedSelectable = selectable ?? overrideObj.selectable;
  // ======================== Collapsed ========================
  // Inline Collapsed
  const mergedInlineCollapsed = inlineCollapsed ?? siderCollapsed;
  // ================ Merged Props for Semantic ================
  const mergedProps = {
    ...props,
    mode: mergedMode,
    inlineCollapsed: mergedInlineCollapsed,
    selectable: mergedSelectable,
    theme
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    },
    subMenu: {
      _default: 'item'
    }
  });
  const defaultMotions = {
    horizontal: {
      motionName: `${rootPrefixCls}-slide-up`
    },
    inline: (0, _motion.default)(rootPrefixCls),
    other: {
      motionName: `${rootPrefixCls}-zoom-big`
    }
  };
  const prefixCls = getPrefixCls('menu', customizePrefixCls || overrideObj.prefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls, !override);
  const menuClassName = (0, _clsx.clsx)(`${prefixCls}-${theme}`, contextClassName, className);
  // ====================== ExpandIcon ========================
  const mergedExpandIcon = React.useMemo(() => {
    if (typeof expandIcon === 'function' || isEmptyIcon(expandIcon)) {
      return expandIcon || null;
    }
    if (typeof overrideObj.expandIcon === 'function' || isEmptyIcon(overrideObj.expandIcon)) {
      return overrideObj.expandIcon || null;
    }
    if (typeof menu?.expandIcon === 'function' || isEmptyIcon(menu?.expandIcon)) {
      return menu?.expandIcon || null;
    }
    const mergedIcon = expandIcon ?? overrideObj?.expandIcon ?? menu?.expandIcon;
    return (0, _reactNode.cloneElement)(mergedIcon, {
      className: (0, _clsx.clsx)(`${prefixCls}-submenu-expand-icon`, /*#__PURE__*/React.isValidElement(mergedIcon) ? mergedIcon.props?.className : undefined)
    });
  }, [expandIcon, overrideObj?.expandIcon, menu?.expandIcon, prefixCls]);
  // ======================== Context ==========================
  const contextValue = React.useMemo(() => ({
    prefixCls,
    inlineCollapsed: mergedInlineCollapsed || false,
    direction,
    firstLevel: true,
    theme,
    mode: mergedMode,
    disableMenuItemTitleTooltip: _internalDisableMenuItemTitleTooltip,
    tooltip,
    classNames: mergedClassNames,
    styles: mergedStyles
  }), [prefixCls, mergedInlineCollapsed, direction, _internalDisableMenuItemTitleTooltip, theme, mergedMode, mergedClassNames, mergedStyles, tooltip]);
  // ========================= Render ==========================
  return /*#__PURE__*/React.createElement(_OverrideContext.default.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(_MenuContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(_menu.default, {
    getPopupContainer: getPopupContainer,
    overflowedIndicator: /*#__PURE__*/React.createElement(_EllipsisOutlined.default, null),
    overflowedIndicatorPopupClassName: (0, _clsx.clsx)(prefixCls, `${prefixCls}-${theme}`, overflowedIndicatorPopupClassName),
    classNames: {
      list: mergedClassNames.list,
      listTitle: mergedClassNames.itemTitle
    },
    styles: {
      list: mergedStyles.list,
      listTitle: mergedStyles.itemTitle
    },
    mode: mergedMode,
    selectable: mergedSelectable,
    onClick: onItemClick,
    ...passedProps,
    inlineCollapsed: mergedInlineCollapsed,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    className: menuClassName,
    prefixCls: prefixCls,
    direction: direction,
    defaultMotions: defaultMotions,
    expandIcon: mergedExpandIcon,
    ref: ref,
    rootClassName: (0, _clsx.clsx)(rootClassName, hashId, overrideObj.rootClassName, cssVarCls, rootCls, mergedClassNames.root),
    _internalComponents: MENU_COMPONENTS
  })));
});
var _default = exports.default = InternalMenu;