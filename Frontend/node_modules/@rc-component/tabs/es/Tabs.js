function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// Accessibility https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
import { clsx } from 'clsx';
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import isMobile from "@rc-component/util/es/isMobile";
import * as React from 'react';
import { useEffect, useState } from 'react';
import TabContext from "./TabContext";
import TabNavListWrapper from "./TabNavList/Wrapper";
import TabPanelList from "./TabPanelList";
import useAnimateConfig from "./hooks/useAnimateConfig";
/**
 * Should added antd:
 * - type
 *
 * Removed:
 * - onNextClick
 * - onPrevClick
 * - keyboard
 */

// Used for accessibility
let uuid = 0;
const Tabs = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    id,
    prefixCls = 'rc-tabs',
    className,
    items,
    direction,
    activeKey,
    defaultActiveKey,
    editable,
    animated,
    tabPosition = 'top',
    tabBarGutter,
    tabBarStyle,
    tabBarExtraContent,
    locale,
    more,
    destroyOnHidden,
    renderTabBar,
    onChange,
    onTabClick,
    onTabScroll,
    getPopupContainer,
    popupClassName,
    indicator,
    classNames: tabsClassNames,
    styles,
    ...restProps
  } = props;
  const tabs = React.useMemo(() => (items || []).filter(item => item && typeof item === 'object' && 'key' in item), [items]);
  const rtl = direction === 'rtl';
  const mergedAnimated = useAnimateConfig(animated);

  // ======================== Mobile ========================
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    // Only update on the client side
    setMobile(isMobile());
  }, []);

  // ====================== Active Key ======================
  const [mergedActiveKey, setMergedActiveKey] = useControlledState(defaultActiveKey ?? tabs[0]?.key, activeKey);
  const [activeIndex, setActiveIndex] = useState(() => tabs.findIndex(tab => tab.key === mergedActiveKey));

  // Reset active key if not exist anymore
  useEffect(() => {
    let newActiveIndex = tabs.findIndex(tab => tab.key === mergedActiveKey);
    if (newActiveIndex === -1) {
      newActiveIndex = Math.max(0, Math.min(activeIndex, tabs.length - 1));
      setMergedActiveKey(tabs[newActiveIndex]?.key);
    }
    setActiveIndex(newActiveIndex);
  }, [tabs.map(tab => tab.key).join('_'), mergedActiveKey, activeIndex]);

  // ===================== Accessibility ====================
  const [mergedId, setMergedId] = useControlledState(null, id);

  // Async generate id to avoid ssr mapping failed
  useEffect(() => {
    if (!id) {
      setMergedId(`rc-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`);
      uuid += 1;
    }
  }, []);

  // ======================== Events ========================
  function onInternalTabClick(key, e) {
    onTabClick?.(key, e);
    const isActiveChanged = key !== mergedActiveKey;
    setMergedActiveKey(key);
    if (isActiveChanged) {
      onChange?.(key);
    }
  }

  // ======================== Render ========================
  const sharedProps = {
    id: mergedId,
    activeKey: mergedActiveKey,
    animated: mergedAnimated,
    tabPosition,
    rtl,
    mobile
  };
  const tabNavBarProps = {
    ...sharedProps,
    editable,
    locale,
    more,
    tabBarGutter,
    onTabClick: onInternalTabClick,
    onTabScroll,
    extra: tabBarExtraContent,
    style: tabBarStyle,
    getPopupContainer,
    popupClassName: clsx(popupClassName, tabsClassNames?.popup),
    indicator,
    styles,
    classNames: tabsClassNames
  };
  const memoizedValue = React.useMemo(() => {
    return {
      tabs,
      prefixCls
    };
  }, [tabs, prefixCls]);
  return /*#__PURE__*/React.createElement(TabContext.Provider, {
    value: memoizedValue
  }, /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    id: id,
    className: clsx(prefixCls, `${prefixCls}-${tabPosition}`, {
      [`${prefixCls}-mobile`]: mobile,
      [`${prefixCls}-editable`]: editable,
      [`${prefixCls}-rtl`]: rtl
    }, className)
  }, restProps), /*#__PURE__*/React.createElement(TabNavListWrapper, _extends({}, tabNavBarProps, {
    renderTabBar: renderTabBar
  })), /*#__PURE__*/React.createElement(TabPanelList, _extends({
    destroyOnHidden: destroyOnHidden
  }, sharedProps, {
    contentStyle: styles?.content,
    contentClassName: tabsClassNames?.content,
    animated: mergedAnimated
  }))));
});
if (process.env.NODE_ENV !== 'production') {
  Tabs.displayName = 'Tabs';
}
export default Tabs;