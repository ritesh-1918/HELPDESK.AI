"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _overflow = _interopRequireDefault(require("@rc-component/overflow"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var _SubMenuList = _interopRequireDefault(require("./SubMenuList"));
var _commonUtil = require("../utils/commonUtil");
var _MenuContext = _interopRequireWildcard(require("../context/MenuContext"));
var _useMemoCallback = _interopRequireDefault(require("../hooks/useMemoCallback"));
var _PopupTrigger = _interopRequireDefault(require("./PopupTrigger"));
var _Icon = _interopRequireDefault(require("../Icon"));
var _useActive = _interopRequireDefault(require("../hooks/useActive"));
var _warnUtil = require("../utils/warnUtil");
var _useDirectionStyle = _interopRequireDefault(require("../hooks/useDirectionStyle"));
var _InlineSubMenuList = _interopRequireDefault(require("./InlineSubMenuList"));
var _PathContext = require("../context/PathContext");
var _IdContext = require("../context/IdContext");
var _PrivateContext = _interopRequireDefault(require("../context/PrivateContext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const InternalSubMenu = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    style,
    className,
    styles,
    classNames: menuClassNames,
    title,
    eventKey,
    warnKey,
    disabled,
    internalPopupClose,
    children,
    // Icons
    itemIcon,
    expandIcon,
    // Popup
    popupClassName,
    popupOffset,
    popupStyle,
    // Events
    onClick,
    onMouseEnter,
    onMouseLeave,
    onTitleClick,
    onTitleMouseEnter,
    onTitleMouseLeave,
    popupRender: propsPopupRender,
    ...restProps
  } = props;
  const domDataId = (0, _IdContext.useMenuId)(eventKey);
  const {
    prefixCls,
    mode,
    openKeys,
    // Disabled
    disabled: contextDisabled,
    overflowDisabled,
    // ActiveKey
    activeKey,
    // SelectKey
    selectedKeys,
    // Icon
    itemIcon: contextItemIcon,
    expandIcon: contextExpandIcon,
    // Events
    onItemClick,
    onOpenChange,
    onActive,
    popupRender: contextPopupRender
  } = React.useContext(_MenuContext.MenuContext);
  const {
    _internalRenderSubMenuItem
  } = React.useContext(_PrivateContext.default);
  const {
    isSubPathKey
  } = React.useContext(_PathContext.PathUserContext);
  const connectedPath = (0, _PathContext.useFullPath)();
  const subMenuPrefixCls = `${prefixCls}-submenu`;
  const mergedDisabled = contextDisabled || disabled;
  const elementRef = React.useRef();
  const popupRef = React.useRef();

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && warnKey) {
    (0, _warning.default)(false, 'SubMenu should not leave undefined `key`.');
  }

  // ================================ Icon ================================
  const mergedItemIcon = itemIcon ?? contextItemIcon;
  const mergedExpandIcon = expandIcon ?? contextExpandIcon;

  // ================================ Open ================================
  const originOpen = openKeys.includes(eventKey);
  const open = !overflowDisabled && originOpen;

  // =============================== Select ===============================
  const childrenSelected = isSubPathKey(selectedKeys, eventKey);

  // =============================== Active ===============================
  const {
    active,
    ...activeProps
  } = (0, _useActive.default)(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave);

  // Fallback of active check to avoid hover on menu title or disabled item
  const [childrenActive, setChildrenActive] = React.useState(false);
  const triggerChildrenActive = newActive => {
    if (!mergedDisabled) {
      setChildrenActive(newActive);
    }
  };
  const onInternalMouseEnter = domEvent => {
    triggerChildrenActive(true);
    onMouseEnter?.({
      key: eventKey,
      domEvent
    });
  };
  const onInternalMouseLeave = domEvent => {
    triggerChildrenActive(false);
    onMouseLeave?.({
      key: eventKey,
      domEvent
    });
  };
  const mergedActive = React.useMemo(() => {
    if (active) {
      return active;
    }
    if (mode !== 'inline') {
      return childrenActive || isSubPathKey([activeKey], eventKey);
    }
    return false;
  }, [mode, active, activeKey, childrenActive, eventKey, isSubPathKey]);

  // ========================== DirectionStyle ==========================
  const directionStyle = (0, _useDirectionStyle.default)(connectedPath.length);

  // =============================== Events ===============================
  // >>>> Title click
  const onInternalTitleClick = e => {
    // Skip if disabled
    if (mergedDisabled) {
      return;
    }
    onTitleClick?.({
      key: eventKey,
      domEvent: e
    });

    // Trigger open by click when mode is `inline`
    if (mode === 'inline') {
      onOpenChange(eventKey, !originOpen);
    }
  };

  // >>>> Context for children click
  const onMergedItemClick = (0, _useMemoCallback.default)(info => {
    onClick?.((0, _warnUtil.warnItemProp)(info));
    onItemClick(info);
  });

  // >>>>> Visible change
  const onPopupVisibleChange = newVisible => {
    if (mode !== 'inline') {
      onOpenChange(eventKey, newVisible);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  const onInternalFocus = () => {
    onActive(eventKey);
  };

  // =============================== Render ===============================
  const popupId = domDataId && `${domDataId}-popup`;
  const expandIconNode = React.useMemo(() => /*#__PURE__*/React.createElement(_Icon.default, {
    icon: mode !== 'horizontal' ? mergedExpandIcon : undefined,
    props: {
      ...props,
      isOpen: open,
      // [Legacy] Not sure why need this mark
      isSubMenu: true
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${subMenuPrefixCls}-arrow`
  })), [mode, mergedExpandIcon, props, open, subMenuPrefixCls]);

  // >>>>> Title
  let titleNode = /*#__PURE__*/React.createElement("div", _extends({
    role: "menuitem",
    style: directionStyle,
    className: `${subMenuPrefixCls}-title`,
    tabIndex: mergedDisabled ? null : -1,
    ref: elementRef,
    title: typeof title === 'string' ? title : null,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId,
    "aria-expanded": open,
    "aria-haspopup": true,
    "aria-controls": popupId,
    "aria-disabled": mergedDisabled,
    onClick: onInternalTitleClick,
    onFocus: onInternalFocus
  }, activeProps), title, expandIconNode);

  // Cache mode if it change to `inline` which do not have popup motion
  const triggerModeRef = React.useRef(mode);
  if (mode !== 'inline' && connectedPath.length > 1) {
    triggerModeRef.current = 'vertical';
  } else {
    triggerModeRef.current = mode;
  }
  const popupContentTriggerMode = triggerModeRef.current;
  const renderPopupContent = React.useMemo(() => {
    const originNode = /*#__PURE__*/React.createElement(_MenuContext.default, {
      classNames: menuClassNames,
      styles: styles,
      mode: popupContentTriggerMode === 'horizontal' ? 'vertical' : popupContentTriggerMode
    }, /*#__PURE__*/React.createElement(_SubMenuList.default, {
      id: popupId,
      ref: popupRef
    }, children));
    const mergedPopupRender = propsPopupRender || contextPopupRender;
    if (mergedPopupRender) {
      const node = mergedPopupRender(originNode, {
        item: props,
        keys: connectedPath
      });
      return node;
    }
    return originNode;
  }, [propsPopupRender, contextPopupRender, connectedPath, popupId, children, props, popupContentTriggerMode]);
  if (!overflowDisabled) {
    const triggerMode = triggerModeRef.current;

    // Still wrap with Trigger here since we need avoid react re-mount dom node
    // Which makes motion failed
    titleNode = /*#__PURE__*/React.createElement(_PopupTrigger.default, {
      mode: triggerMode,
      prefixCls: subMenuPrefixCls,
      visible: !internalPopupClose && open && mode !== 'inline',
      popupClassName: popupClassName,
      popupOffset: popupOffset,
      popupStyle: popupStyle,
      popup: renderPopupContent,
      disabled: mergedDisabled,
      onVisibleChange: onPopupVisibleChange
    }, titleNode);
  }

  // >>>>> List node
  let listNode = /*#__PURE__*/React.createElement(_overflow.default.Item, _extends({
    ref: ref,
    role: "none"
  }, restProps, {
    component: "li",
    style: style,
    className: (0, _clsx.clsx)(subMenuPrefixCls, `${subMenuPrefixCls}-${mode}`, className, {
      [`${subMenuPrefixCls}-open`]: open,
      [`${subMenuPrefixCls}-active`]: mergedActive,
      [`${subMenuPrefixCls}-selected`]: childrenSelected,
      [`${subMenuPrefixCls}-disabled`]: mergedDisabled
    }),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && /*#__PURE__*/React.createElement(_InlineSubMenuList.default, {
    id: popupId,
    open: open,
    keyPath: connectedPath
  }, children));
  if (_internalRenderSubMenuItem) {
    listNode = _internalRenderSubMenuItem(listNode, props, {
      selected: childrenSelected,
      active: mergedActive,
      open,
      disabled: mergedDisabled
    });
  }

  // >>>>> Render
  return /*#__PURE__*/React.createElement(_MenuContext.default, {
    classNames: menuClassNames,
    styles: styles,
    onItemClick: onMergedItemClick,
    mode: mode === 'horizontal' ? 'vertical' : mode,
    itemIcon: mergedItemIcon,
    expandIcon: mergedExpandIcon
  }, listNode);
});
const SubMenu = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    eventKey,
    children
  } = props;
  const connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);
  const childList = (0, _commonUtil.parseChildren)(children, connectedKeyPath);

  // ==================== Record KeyPath ====================
  const measure = (0, _PathContext.useMeasure)();

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return () => {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  let renderNode;

  // ======================== Render ========================
  if (measure) {
    renderNode = childList;
  } else {
    renderNode = /*#__PURE__*/React.createElement(InternalSubMenu, _extends({
      ref: ref
    }, props), childList);
  }
  return /*#__PURE__*/React.createElement(_PathContext.PathTrackerContext.Provider, {
    value: connectedKeyPath
  }, renderNode);
});
if (process.env.NODE_ENV !== 'production') {
  SubMenu.displayName = 'SubMenu';
}
var _default = exports.default = SubMenu;