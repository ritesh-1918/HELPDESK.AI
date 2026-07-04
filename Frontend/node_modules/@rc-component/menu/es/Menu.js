function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import Overflow from '@rc-component/overflow';
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import useId from "@rc-component/util/es/hooks/useId";
import isEqual from "@rc-component/util/es/isEqual";
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { useImperativeHandle } from 'react';
import { flushSync } from 'react-dom';
import { IdContext } from "./context/IdContext";
import MenuContextProvider from "./context/MenuContext";
import { PathRegisterContext, PathUserContext } from "./context/PathContext";
import PrivateContext from "./context/PrivateContext";
import { getFocusableElements, refreshElements, useAccessibility } from "./hooks/useAccessibility";
import useKeyRecords, { OVERFLOW_KEY } from "./hooks/useKeyRecords";
import useMemoCallback from "./hooks/useMemoCallback";
import MenuItem from "./MenuItem";
import SubMenu from "./SubMenu";
import { parseItems } from "./utils/nodeUtil";
import { warnItemProp } from "./utils/warnUtil";

/**
 * Menu modify after refactor:
 * ## Add
 * - disabled
 *
 * ## Remove
 * - openTransitionName
 * - openAnimation
 * - onDestroy
 * - siderCollapsed: Seems antd do not use this prop (Need test in antd)
 * - collapsedWidth: Seems this logic should be handle by antd Layout.Sider
 */

// optimize for render
const EMPTY_LIST = [];
const Menu = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls = 'rc-menu',
    rootClassName,
    style,
    className,
    styles,
    classNames: menuClassNames,
    tabIndex = 0,
    items,
    children,
    direction,
    id,
    // Mode
    mode = 'vertical',
    inlineCollapsed,
    // Disabled
    disabled,
    disabledOverflow,
    // Open
    subMenuOpenDelay = 0.1,
    subMenuCloseDelay = 0.1,
    forceSubMenuRender,
    defaultOpenKeys,
    openKeys,
    // Active
    activeKey,
    defaultActiveFirst,
    // Selection
    selectable = true,
    multiple = false,
    defaultSelectedKeys,
    selectedKeys,
    onSelect,
    onDeselect,
    // Level
    inlineIndent = 24,
    // Motion
    motion,
    defaultMotions,
    // Popup
    triggerSubMenuAction = 'hover',
    builtinPlacements,
    // Icon
    itemIcon,
    expandIcon,
    overflowedIndicator = '...',
    overflowedIndicatorPopupClassName,
    // Function
    getPopupContainer,
    // Events
    onClick,
    onOpenChange,
    onKeyDown,
    // Deprecated
    openAnimation,
    openTransitionName,
    // Internal
    _internalRenderMenuItem,
    _internalRenderSubMenuItem,
    _internalComponents,
    popupRender,
    ...restProps
  } = props;
  const [childList, measureChildList] = React.useMemo(() => [parseItems(children, items, EMPTY_LIST, _internalComponents, prefixCls), parseItems(children, items, EMPTY_LIST, {}, prefixCls)], [children, items, _internalComponents]);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef();
  const uuid = useId(id ? `rc-menu-uuid-${id}` : 'rc-menu-uuid');
  const isRtl = direction === 'rtl';

  // ========================= Warn =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(!openAnimation && !openTransitionName, '`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.');
  }

  // ========================= Open =========================
  const [innerOpenKeys, setMergedOpenKeys] = useControlledState(defaultOpenKeys, openKeys);
  const mergedOpenKeys = innerOpenKeys || EMPTY_LIST;

  // React 18 will merge mouse event which means we open key will not sync
  // ref: https://github.com/ant-design/ant-design/issues/38818
  const triggerOpenKeys = (keys, forceFlush = false) => {
    function doUpdate() {
      setMergedOpenKeys(keys);
      onOpenChange?.(keys);
    }
    if (forceFlush) {
      flushSync(doUpdate);
    } else {
      doUpdate();
    }
  };

  // >>>>> Cache & Reset open keys when inlineCollapsed changed
  const [inlineCacheOpenKeys, setInlineCacheOpenKeys] = React.useState(mergedOpenKeys);
  const mountRef = React.useRef(false);

  // ========================= Mode =========================
  const [mergedMode, mergedInlineCollapsed] = React.useMemo(() => {
    if ((mode === 'inline' || mode === 'vertical') && inlineCollapsed) {
      return ['vertical', inlineCollapsed];
    }
    return [mode, false];
  }, [mode, inlineCollapsed]);
  const isInlineMode = mergedMode === 'inline';
  const [internalMode, setInternalMode] = React.useState(mergedMode);
  const [internalInlineCollapsed, setInternalInlineCollapsed] = React.useState(mergedInlineCollapsed);
  React.useEffect(() => {
    setInternalMode(mergedMode);
    setInternalInlineCollapsed(mergedInlineCollapsed);
    if (!mountRef.current) {
      return;
    }
    // Synchronously update MergedOpenKeys
    if (isInlineMode) {
      setMergedOpenKeys(inlineCacheOpenKeys);
    } else {
      // Trigger open event in case its in control
      triggerOpenKeys(EMPTY_LIST);
    }
  }, [mergedMode, mergedInlineCollapsed]);

  // ====================== Responsive ======================
  const [lastVisibleIndex, setLastVisibleIndex] = React.useState(0);
  const allVisible = lastVisibleIndex >= childList.length - 1 || internalMode !== 'horizontal' || disabledOverflow;

  // Cache
  React.useEffect(() => {
    if (isInlineMode) {
      setInlineCacheOpenKeys(mergedOpenKeys);
    }
  }, [mergedOpenKeys]);
  React.useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  // ========================= Path =========================
  const {
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys
  } = useKeyRecords();
  const registerPathContext = React.useMemo(() => ({
    registerPath,
    unregisterPath
  }), [registerPath, unregisterPath]);
  const pathUserContext = React.useMemo(() => ({
    isSubPathKey
  }), [isSubPathKey]);
  React.useEffect(() => {
    refreshOverflowKeys(allVisible ? EMPTY_LIST : childList.slice(lastVisibleIndex + 1).map(child => child.key));
  }, [lastVisibleIndex, allVisible]);

  // ======================== Active ========================
  const [mergedActiveKey, setMergedActiveKey] = useControlledState(activeKey || defaultActiveFirst && childList[0]?.key, activeKey);
  const onActive = useMemoCallback(key => {
    setMergedActiveKey(key);
  });
  const onInactive = useMemoCallback(() => {
    setMergedActiveKey(undefined);
  });
  useImperativeHandle(ref, () => {
    return {
      list: containerRef.current,
      focus: options => {
        const keys = getKeys();
        const {
          elements,
          key2element,
          element2key
        } = refreshElements(keys, uuid);
        const focusableElements = getFocusableElements(containerRef.current, elements);
        let shouldFocusKey;
        if (mergedActiveKey && keys.includes(mergedActiveKey)) {
          shouldFocusKey = mergedActiveKey;
        } else {
          shouldFocusKey = focusableElements[0] ? element2key.get(focusableElements[0]) : childList.find(node => !node.props.disabled)?.key;
        }
        const elementToFocus = key2element.get(shouldFocusKey);
        if (shouldFocusKey && elementToFocus) {
          elementToFocus?.focus?.(options);
        }
      },
      findItem: ({
        key: itemKey
      }) => {
        const keys = getKeys();
        const {
          key2element
        } = refreshElements(keys, uuid);
        return key2element.get(itemKey) || null;
      }
    };
  });

  // ======================== Select ========================
  // >>>>> Select keys
  const [internalSelectKeys, setMergedSelectKeys] = useControlledState(defaultSelectedKeys || [], selectedKeys);
  const mergedSelectKeys = React.useMemo(() => {
    if (Array.isArray(internalSelectKeys)) {
      return internalSelectKeys;
    }
    if (internalSelectKeys === null || internalSelectKeys === undefined) {
      return EMPTY_LIST;
    }
    return [internalSelectKeys];
  }, [internalSelectKeys]);

  // >>>>> Trigger select
  const triggerSelection = info => {
    if (selectable) {
      // Insert or Remove
      const {
        key: targetKey
      } = info;
      const exist = mergedSelectKeys.includes(targetKey);
      let newSelectKeys;
      if (multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys.filter(key => key !== targetKey);
        } else {
          newSelectKeys = [...mergedSelectKeys, targetKey];
        }
      } else {
        newSelectKeys = [targetKey];
      }
      setMergedSelectKeys(newSelectKeys);

      // Trigger event
      const selectInfo = {
        ...info,
        selectedKeys: newSelectKeys
      };
      if (exist) {
        onDeselect?.(selectInfo);
      } else {
        onSelect?.(selectInfo);
      }
    }

    // Whatever selectable, always close it
    if (!multiple && mergedOpenKeys.length && internalMode !== 'inline') {
      triggerOpenKeys(EMPTY_LIST);
    }
  };

  // ========================= Open =========================
  /**
   * Click for item. SubMenu do not have selection status
   */
  const onInternalClick = useMemoCallback(info => {
    onClick?.(warnItemProp(info));
    triggerSelection(info);
  });
  const onInternalOpenChange = useMemoCallback((key, open) => {
    let newOpenKeys = mergedOpenKeys.filter(k => k !== key);
    if (open) {
      newOpenKeys.push(key);
    } else if (internalMode !== 'inline') {
      // We need find all related popup to close
      const subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(k => !subPathKeys.has(k));
    }
    if (!isEqual(mergedOpenKeys, newOpenKeys, true)) {
      triggerOpenKeys(newOpenKeys, true);
    }
  });

  // ==================== Accessibility =====================
  const triggerAccessibilityOpen = (key, open) => {
    const nextOpen = open ?? !mergedOpenKeys.includes(key);
    onInternalOpenChange(key, nextOpen);
  };
  const onInternalKeyDown = useAccessibility(internalMode, mergedActiveKey, isRtl, uuid, containerRef, getKeys, getKeyPath, setMergedActiveKey, triggerAccessibilityOpen, onKeyDown);

  // ======================== Effect ========================
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ======================= Context ========================
  const privateContext = React.useMemo(() => ({
    _internalRenderMenuItem,
    _internalRenderSubMenuItem
  }), [_internalRenderMenuItem, _internalRenderSubMenuItem]);

  // ======================== Render ========================

  // >>>>> Children
  const wrappedChildList = internalMode !== 'horizontal' || disabledOverflow ? childList :
  // Need wrap for overflow dropdown that do not response for open
  childList.map((child, index) =>
  /*#__PURE__*/
  // Always wrap provider to avoid sub node re-mount
  React.createElement(MenuContextProvider, {
    key: child.key,
    overflowDisabled: index > lastVisibleIndex,
    classNames: menuClassNames,
    styles: styles
  }, child));

  // >>>>> Container
  const container = /*#__PURE__*/React.createElement(Overflow, _extends({
    id: id,
    ref: containerRef,
    prefixCls: `${prefixCls}-overflow`,
    component: "ul",
    itemComponent: MenuItem,
    className: clsx(prefixCls, `${prefixCls}-root`, `${prefixCls}-${internalMode}`, className, {
      [`${prefixCls}-inline-collapsed`]: internalInlineCollapsed,
      [`${prefixCls}-rtl`]: isRtl
    }, rootClassName),
    dir: direction,
    style: style,
    role: "menu",
    tabIndex: tabIndex,
    data: wrappedChildList,
    renderRawItem: node => node,
    renderRawRest: omitItems => {
      // We use origin list since wrapped list use context to prevent open
      const len = omitItems.length;
      const originOmitItems = len ? childList.slice(-len) : null;
      return /*#__PURE__*/React.createElement(SubMenu, {
        eventKey: OVERFLOW_KEY,
        title: overflowedIndicator,
        disabled: allVisible,
        internalPopupClose: len === 0,
        popupClassName: overflowedIndicatorPopupClassName
      }, originOmitItems);
    },
    maxCount: internalMode !== 'horizontal' || disabledOverflow ? Overflow.INVALIDATE : Overflow.RESPONSIVE,
    ssr: "full",
    "data-menu-list": true,
    onVisibleChange: newLastIndex => {
      setLastVisibleIndex(newLastIndex);
    },
    onKeyDown: onInternalKeyDown
  }, restProps));

  // >>>>> Render
  return /*#__PURE__*/React.createElement(PrivateContext.Provider, {
    value: privateContext
  }, /*#__PURE__*/React.createElement(IdContext.Provider, {
    value: uuid
  }, /*#__PURE__*/React.createElement(MenuContextProvider, {
    prefixCls: prefixCls,
    rootClassName: rootClassName,
    classNames: menuClassNames,
    styles: styles,
    mode: internalMode,
    openKeys: mergedOpenKeys,
    rtl: isRtl
    // Disabled
    ,
    disabled: disabled
    // Motion
    ,
    motion: mounted ? motion : null,
    defaultMotions: mounted ? defaultMotions : null
    // Active
    ,
    activeKey: mergedActiveKey,
    onActive: onActive,
    onInactive: onInactive
    // Selection
    ,
    selectedKeys: mergedSelectKeys
    // Level
    ,
    inlineIndent: inlineIndent
    // Popup
    ,
    subMenuOpenDelay: subMenuOpenDelay,
    subMenuCloseDelay: subMenuCloseDelay,
    forceSubMenuRender: forceSubMenuRender,
    builtinPlacements: builtinPlacements,
    triggerSubMenuAction: triggerSubMenuAction,
    getPopupContainer: getPopupContainer
    // Icon
    ,
    itemIcon: itemIcon,
    expandIcon: expandIcon
    // Events
    ,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange,
    popupRender: popupRender
  }, /*#__PURE__*/React.createElement(PathUserContext.Provider, {
    value: pathUserContext
  }, container), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'none'
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(PathRegisterContext.Provider, {
    value: registerPathContext
  }, measureChildList)))));
});
export default Menu;