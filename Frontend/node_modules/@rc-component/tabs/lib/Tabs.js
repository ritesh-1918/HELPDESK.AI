"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _useControlledState = _interopRequireDefault(require("@rc-component/util/lib/hooks/useControlledState"));
var _isMobile = _interopRequireDefault(require("@rc-component/util/lib/isMobile"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _TabContext = _interopRequireDefault(require("./TabContext"));
var _Wrapper = _interopRequireDefault(require("./TabNavList/Wrapper"));
var _TabPanelList = _interopRequireDefault(require("./TabPanelList"));
var _useAnimateConfig = _interopRequireDefault(require("./hooks/useAnimateConfig"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // Accessibility https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
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
  const mergedAnimated = (0, _useAnimateConfig.default)(animated);

  // ======================== Mobile ========================
  const [mobile, setMobile] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    // Only update on the client side
    setMobile((0, _isMobile.default)());
  }, []);

  // ====================== Active Key ======================
  const [mergedActiveKey, setMergedActiveKey] = (0, _useControlledState.default)(defaultActiveKey ?? tabs[0]?.key, activeKey);
  const [activeIndex, setActiveIndex] = (0, _react.useState)(() => tabs.findIndex(tab => tab.key === mergedActiveKey));

  // Reset active key if not exist anymore
  (0, _react.useEffect)(() => {
    let newActiveIndex = tabs.findIndex(tab => tab.key === mergedActiveKey);
    if (newActiveIndex === -1) {
      newActiveIndex = Math.max(0, Math.min(activeIndex, tabs.length - 1));
      setMergedActiveKey(tabs[newActiveIndex]?.key);
    }
    setActiveIndex(newActiveIndex);
  }, [tabs.map(tab => tab.key).join('_'), mergedActiveKey, activeIndex]);

  // ===================== Accessibility ====================
  const [mergedId, setMergedId] = (0, _useControlledState.default)(null, id);

  // Async generate id to avoid ssr mapping failed
  (0, _react.useEffect)(() => {
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
    popupClassName: (0, _clsx.clsx)(popupClassName, tabsClassNames?.popup),
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
  return /*#__PURE__*/React.createElement(_TabContext.default.Provider, {
    value: memoizedValue
  }, /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    id: id,
    className: (0, _clsx.clsx)(prefixCls, `${prefixCls}-${tabPosition}`, {
      [`${prefixCls}-mobile`]: mobile,
      [`${prefixCls}-editable`]: editable,
      [`${prefixCls}-rtl`]: rtl
    }, className)
  }, restProps), /*#__PURE__*/React.createElement(_Wrapper.default, _extends({}, tabNavBarProps, {
    renderTabBar: renderTabBar
  })), /*#__PURE__*/React.createElement(_TabPanelList.default, _extends({
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
var _default = exports.default = Tabs;