function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import Overflow from '@rc-component/overflow';
import warning from "@rc-component/util/es/warning";
import SubMenuList from "./SubMenuList";
import { parseChildren } from "../utils/commonUtil";
import MenuContextProvider, { MenuContext } from "../context/MenuContext";
import useMemoCallback from "../hooks/useMemoCallback";
import PopupTrigger from "./PopupTrigger";
import Icon from "../Icon";
import useActive from "../hooks/useActive";
import { warnItemProp } from "../utils/warnUtil";
import useDirectionStyle from "../hooks/useDirectionStyle";
import InlineSubMenuList from "./InlineSubMenuList";
import { PathTrackerContext, PathUserContext, useFullPath, useMeasure } from "../context/PathContext";
import { useMenuId } from "../context/IdContext";
import PrivateContext from "../context/PrivateContext";
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
  const domDataId = useMenuId(eventKey);
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
  } = React.useContext(MenuContext);
  const {
    _internalRenderSubMenuItem
  } = React.useContext(PrivateContext);
  const {
    isSubPathKey
  } = React.useContext(PathUserContext);
  const connectedPath = useFullPath();
  const subMenuPrefixCls = `${prefixCls}-submenu`;
  const mergedDisabled = contextDisabled || disabled;
  const elementRef = React.useRef();
  const popupRef = React.useRef();

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && warnKey) {
    warning(false, 'SubMenu should not leave undefined `key`.');
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
  } = useActive(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave);

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
  const directionStyle = useDirectionStyle(connectedPath.length);

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
  const onMergedItemClick = useMemoCallback(info => {
    onClick?.(warnItemProp(info));
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
  const expandIconNode = React.useMemo(() => /*#__PURE__*/React.createElement(Icon, {
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
    const originNode = /*#__PURE__*/React.createElement(MenuContextProvider, {
      classNames: menuClassNames,
      styles: styles,
      mode: popupContentTriggerMode === 'horizontal' ? 'vertical' : popupContentTriggerMode
    }, /*#__PURE__*/React.createElement(SubMenuList, {
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
    titleNode = /*#__PURE__*/React.createElement(PopupTrigger, {
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
  let listNode = /*#__PURE__*/React.createElement(Overflow.Item, _extends({
    ref: ref,
    role: "none"
  }, restProps, {
    component: "li",
    style: style,
    className: clsx(subMenuPrefixCls, `${subMenuPrefixCls}-${mode}`, className, {
      [`${subMenuPrefixCls}-open`]: open,
      [`${subMenuPrefixCls}-active`]: mergedActive,
      [`${subMenuPrefixCls}-selected`]: childrenSelected,
      [`${subMenuPrefixCls}-disabled`]: mergedDisabled
    }),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && /*#__PURE__*/React.createElement(InlineSubMenuList, {
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
  return /*#__PURE__*/React.createElement(MenuContextProvider, {
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
  const connectedKeyPath = useFullPath(eventKey);
  const childList = parseChildren(children, connectedKeyPath);

  // ==================== Record KeyPath ====================
  const measure = useMeasure();

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
  return /*#__PURE__*/React.createElement(PathTrackerContext.Provider, {
    value: connectedKeyPath
  }, renderNode);
});
if (process.env.NODE_ENV !== 'production') {
  SubMenu.displayName = 'SubMenu';
}
export default SubMenu;