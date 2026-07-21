"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _useEvent = _interopRequireDefault(require("@rc-component/util/lib/hooks/useEvent"));
var _ref = require("@rc-component/util/lib/ref");
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _TabContext = _interopRequireDefault(require("../TabContext"));
var _useIndicator = _interopRequireDefault(require("../hooks/useIndicator"));
var _useOffsets = _interopRequireDefault(require("../hooks/useOffsets"));
var _useSyncState = _interopRequireDefault(require("../hooks/useSyncState"));
var _useTouchMove = _interopRequireDefault(require("../hooks/useTouchMove"));
var _useUpdate = _interopRequireWildcard(require("../hooks/useUpdate"));
var _useVisibleRange = _interopRequireDefault(require("../hooks/useVisibleRange"));
var _util = require("../util");
var _AddButton = _interopRequireDefault(require("./AddButton"));
var _ExtraContent = _interopRequireDefault(require("./ExtraContent"));
var _OperationNode = _interopRequireDefault(require("./OperationNode"));
var _TabNode = _interopRequireDefault(require("./TabNode"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const getTabSize = (tab, containerRect) => {
  // tabListRef
  const {
    offsetWidth,
    offsetHeight,
    offsetTop,
    offsetLeft
  } = tab;
  const {
    width,
    height,
    left,
    top
  } = tab.getBoundingClientRect();

  // Use getBoundingClientRect to avoid decimal inaccuracy
  if (Math.abs(width - offsetWidth) < 1) {
    return [width, height, left - containerRect.left, top - containerRect.top];
  }
  return [offsetWidth, offsetHeight, offsetLeft, offsetTop];
};
const getSize = refObj => {
  const {
    offsetWidth = 0,
    offsetHeight = 0
  } = refObj.current || {};

  // Use getBoundingClientRect to avoid decimal inaccuracy
  if (refObj.current) {
    const {
      width,
      height
    } = refObj.current.getBoundingClientRect();
    if (Math.abs(width - offsetWidth) < 1) {
      return [width, height];
    }
  }
  return [offsetWidth, offsetHeight];
};

/**
 * Convert `SizeInfo` to unit value. Such as [123, 456] with `top` position get `123`
 */
const getUnitValue = (size, tabPositionTopOrBottom) => {
  return size[tabPositionTopOrBottom ? 0 : 1];
};
const TabNavList = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    style,
    id,
    animated,
    activeKey,
    rtl,
    extra,
    editable,
    locale,
    tabPosition,
    tabBarGutter,
    children,
    onTabClick,
    onTabScroll,
    indicator,
    classNames: tabsClassNames,
    styles
  } = props;
  const {
    prefixCls,
    tabs
  } = React.useContext(_TabContext.default);
  const containerRef = (0, _react.useRef)(null);
  const extraLeftRef = (0, _react.useRef)(null);
  const extraRightRef = (0, _react.useRef)(null);
  const tabsWrapperRef = (0, _react.useRef)(null);
  const tabListRef = (0, _react.useRef)(null);
  const operationsRef = (0, _react.useRef)(null);
  const innerAddButtonRef = (0, _react.useRef)(null);
  const tabPositionTopOrBottom = tabPosition === 'top' || tabPosition === 'bottom';
  const [transformLeft, setTransformLeft] = (0, _useSyncState.default)(0, (next, prev) => {
    if (tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? 'left' : 'right'
      });
    }
  });
  const [transformTop, setTransformTop] = (0, _useSyncState.default)(0, (next, prev) => {
    if (!tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? 'top' : 'bottom'
      });
    }
  });
  const [containerExcludeExtraSize, setContainerExcludeExtraSize] = (0, _react.useState)([0, 0]);
  const [tabContentSize, setTabContentSize] = (0, _react.useState)([0, 0]);
  const [addSize, setAddSize] = (0, _react.useState)([0, 0]);
  const [operationSize, setOperationSize] = (0, _react.useState)([0, 0]);
  const [tabSizes, setTabSizes] = (0, _useUpdate.useUpdateState)(new Map());
  const tabOffsets = (0, _useOffsets.default)(tabs, tabSizes, tabContentSize[0]);

  // ========================== Unit =========================
  const containerExcludeExtraSizeValue = getUnitValue(containerExcludeExtraSize, tabPositionTopOrBottom);
  const tabContentSizeValue = getUnitValue(tabContentSize, tabPositionTopOrBottom);
  const addSizeValue = getUnitValue(addSize, tabPositionTopOrBottom);
  const operationSizeValue = getUnitValue(operationSize, tabPositionTopOrBottom);
  const needScroll = Math.floor(containerExcludeExtraSizeValue) < Math.floor(tabContentSizeValue + addSizeValue);
  const visibleTabContentValue = needScroll ? containerExcludeExtraSizeValue - operationSizeValue : containerExcludeExtraSizeValue - addSizeValue;

  // ========================== Util =========================
  const operationsHiddenClassName = `${prefixCls}-nav-operations-hidden`;
  let transformMin = 0;
  let transformMax = 0;
  if (!tabPositionTopOrBottom) {
    transformMin = Math.min(0, visibleTabContentValue - tabContentSizeValue);
    transformMax = 0;
  } else if (rtl) {
    transformMin = 0;
    transformMax = Math.max(0, tabContentSizeValue - visibleTabContentValue);
  } else {
    transformMin = Math.min(0, visibleTabContentValue - tabContentSizeValue);
    transformMax = 0;
  }
  function alignInRange(value) {
    if (value < transformMin) {
      return transformMin;
    }
    if (value > transformMax) {
      return transformMax;
    }
    return value;
  }

  // ========================= Mobile ========================
  const touchMovingRef = (0, _react.useRef)(null);
  const [lockAnimation, setLockAnimation] = (0, _react.useState)();
  function doLockAnimation() {
    setLockAnimation(Date.now());
  }
  function clearTouchMoving() {
    if (touchMovingRef.current) {
      clearTimeout(touchMovingRef.current);
    }
  }
  (0, _useTouchMove.default)(tabsWrapperRef, (offsetX, offsetY) => {
    function doMove(setState, offset) {
      setState(value => {
        const newValue = alignInRange(value + offset);
        return newValue;
      });
    }

    // Skip scroll if place is enough
    if (!needScroll) {
      return false;
    }
    if (tabPositionTopOrBottom) {
      doMove(setTransformLeft, offsetX);
    } else {
      doMove(setTransformTop, offsetY);
    }
    clearTouchMoving();
    doLockAnimation();
    return true;
  });
  (0, _react.useEffect)(() => {
    clearTouchMoving();
    if (lockAnimation) {
      touchMovingRef.current = setTimeout(() => {
        setLockAnimation(0);
      }, 100);
    }
    return clearTouchMoving;
  }, [lockAnimation]);

  // ===================== Visible Range =====================
  // Render tab node & collect tab offset
  const [visibleStart, visibleEnd] = (0, _useVisibleRange.default)(tabOffsets,
  // Container
  visibleTabContentValue,
  // Transform
  tabPositionTopOrBottom ? transformLeft : transformTop,
  // Tabs
  tabContentSizeValue,
  // Add
  addSizeValue,
  // Operation
  operationSizeValue, {
    ...props,
    tabs
  });

  // ========================= Scroll ========================
  const scrollToTab = (0, _useEvent.default)((key = activeKey) => {
    const tabOffset = tabOffsets.get(key) || {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0
    };
    if (tabPositionTopOrBottom) {
      // ============ Align with top & bottom ============
      let newTransform = transformLeft;

      // RTL
      if (rtl) {
        if (tabOffset.right < transformLeft) {
          newTransform = tabOffset.right;
        } else if (tabOffset.right + tabOffset.width > transformLeft + visibleTabContentValue) {
          newTransform = tabOffset.right + tabOffset.width - visibleTabContentValue;
        }
      }
      // LTR
      else if (tabOffset.left < -transformLeft) {
        newTransform = -tabOffset.left;
      } else if (tabOffset.left + tabOffset.width > -transformLeft + visibleTabContentValue) {
        newTransform = -(tabOffset.left + tabOffset.width - visibleTabContentValue);
      }
      setTransformTop(0);
      setTransformLeft(alignInRange(newTransform));
    } else {
      // ============ Align with left & right ============
      let newTransform = transformTop;
      if (tabOffset.top < -transformTop) {
        newTransform = -tabOffset.top;
      } else if (tabOffset.top + tabOffset.height > -transformTop + visibleTabContentValue) {
        newTransform = -(tabOffset.top + tabOffset.height - visibleTabContentValue);
      }
      setTransformLeft(0);
      setTransformTop(alignInRange(newTransform));
    }
  });

  // ========================= Focus =========================
  const [focusKey, setFocusKey] = (0, _react.useState)();
  const [isMouse, setIsMouse] = (0, _react.useState)(false);
  const enabledTabs = tabs.filter(tab => !tab.disabled).map(tab => tab.key);
  const onOffset = offset => {
    const currentIndex = enabledTabs.indexOf(focusKey || activeKey);
    const len = enabledTabs.length;
    const nextIndex = (currentIndex + offset + len) % len;
    const newKey = enabledTabs[nextIndex];
    setFocusKey(newKey);
  };
  const handleRemoveTab = (removalTabKey, e) => {
    const removeIndex = enabledTabs.indexOf(removalTabKey);
    const removeTab = tabs.find(tab => tab.key === removalTabKey);
    const removable = (0, _util.getRemovable)(removeTab?.closable, removeTab?.closeIcon, editable, removeTab?.disabled);
    if (removable) {
      e.preventDefault();
      e.stopPropagation();
      editable.onEdit('remove', {
        key: removalTabKey,
        event: e
      });

      // when remove last tab, focus previous tab
      if (removeIndex === enabledTabs.length - 1) {
        onOffset(-1);
      } else {
        onOffset(1);
      }
    }
  };
  const handleMouseDown = (key, e) => {
    setIsMouse(true);
    // Middle mouse button
    if (e.button === 1) {
      handleRemoveTab(key, e);
    }
  };
  const handleKeyDown = e => {
    const {
      code
    } = e;
    const isRTL = rtl && tabPositionTopOrBottom;
    const firstEnabledTab = enabledTabs[0];
    const lastEnabledTab = enabledTabs[enabledTabs.length - 1];
    switch (code) {
      // LEFT
      case 'ArrowLeft':
        {
          if (tabPositionTopOrBottom) {
            onOffset(isRTL ? 1 : -1);
          }
          break;
        }

      // RIGHT
      case 'ArrowRight':
        {
          if (tabPositionTopOrBottom) {
            onOffset(isRTL ? -1 : 1);
          }
          break;
        }

      // UP
      case 'ArrowUp':
        {
          e.preventDefault();
          if (!tabPositionTopOrBottom) {
            onOffset(-1);
          }
          break;
        }

      // DOWN
      case 'ArrowDown':
        {
          e.preventDefault();
          if (!tabPositionTopOrBottom) {
            onOffset(1);
          }
          break;
        }

      // HOME
      case 'Home':
        {
          e.preventDefault();
          setFocusKey(firstEnabledTab);
          break;
        }

      // END
      case 'End':
        {
          e.preventDefault();
          setFocusKey(lastEnabledTab);
          break;
        }

      // Enter & Space
      case 'Enter':
      case 'Space':
        {
          e.preventDefault();
          onTabClick(focusKey ?? activeKey, e);
          break;
        }
      // Backspace
      case 'Backspace':
      case 'Delete':
        {
          handleRemoveTab(focusKey, e);
          break;
        }
    }
  };

  // ========================== Tab ==========================
  const tabNodeStyle = {};
  if (tabPositionTopOrBottom) {
    tabNodeStyle.marginInlineStart = tabBarGutter;
  } else {
    tabNodeStyle.marginTop = tabBarGutter;
  }
  const tabNodes = tabs.map((tab, i) => {
    const {
      key
    } = tab;
    return /*#__PURE__*/React.createElement(_TabNode.default, {
      id: id,
      prefixCls: prefixCls,
      key: key,
      tab: tab,
      className: tabsClassNames?.item
      /* first node should not have margin left */,
      style: i === 0 ? styles?.item : {
        ...tabNodeStyle,
        ...styles?.item
      },
      closable: tab.closable,
      editable: editable,
      active: key === activeKey,
      focus: key === focusKey,
      renderWrapper: children,
      removeAriaLabel: locale?.removeAriaLabel,
      tabCount: enabledTabs.length,
      currentPosition: i + 1,
      onClick: e => {
        onTabClick(key, e);
      },
      onKeyDown: handleKeyDown,
      onFocus: () => {
        if (!isMouse) {
          setFocusKey(key);
        }
        scrollToTab(key);
        doLockAnimation();
        if (!tabsWrapperRef.current) {
          return;
        }
        // Focus element will make scrollLeft change which we should reset back
        if (!rtl) {
          tabsWrapperRef.current.scrollLeft = 0;
        }
        tabsWrapperRef.current.scrollTop = 0;
      },
      onBlur: () => {
        setFocusKey(undefined);
      },
      onMouseDown: e => handleMouseDown(key, e),
      onMouseUp: () => {
        setIsMouse(false);
      }
    });
  });

  // Update buttons records
  const updateTabSizes = () => setTabSizes(() => {
    const newSizes = new Map();
    const listRect = tabListRef.current?.getBoundingClientRect();
    tabs.forEach(({
      key
    }) => {
      const btnNode = tabListRef.current?.querySelector(`[data-node-key="${(0, _util.genDataNodeKey)(key)}"]`);
      if (btnNode) {
        const [width, height, left, top] = getTabSize(btnNode, listRect);
        newSizes.set(key, {
          width,
          height,
          left,
          top
        });
      }
    });
    return newSizes;
  });
  (0, _react.useEffect)(() => {
    updateTabSizes();
  }, [tabs.map(tab => tab.key).join('_')]);
  const onListHolderResize = (0, _useUpdate.default)(() => {
    // Update wrapper records
    const containerSize = getSize(containerRef);
    const extraLeftSize = getSize(extraLeftRef);
    const extraRightSize = getSize(extraRightRef);
    setContainerExcludeExtraSize([containerSize[0] - extraLeftSize[0] - extraRightSize[0], containerSize[1] - extraLeftSize[1] - extraRightSize[1]]);
    const newAddSize = getSize(innerAddButtonRef);
    setAddSize(newAddSize);
    const newOperationSize = getSize(operationsRef);
    setOperationSize(newOperationSize);

    // Which includes add button size
    const tabContentFullSize = getSize(tabListRef);
    setTabContentSize([tabContentFullSize[0] - newAddSize[0], tabContentFullSize[1] - newAddSize[1]]);

    // Update buttons records
    updateTabSizes();
  });

  // ======================== Dropdown =======================
  const startHiddenTabs = tabs.slice(0, visibleStart);
  const endHiddenTabs = tabs.slice(visibleEnd + 1);
  const hiddenTabs = [...startHiddenTabs, ...endHiddenTabs];

  // =================== Link & Operations ===================
  const activeTabOffset = tabOffsets.get(activeKey);
  const {
    style: indicatorStyle
  } = (0, _useIndicator.default)({
    activeTabOffset,
    horizontal: tabPositionTopOrBottom,
    indicator,
    rtl
  });

  // ========================= Effect ========================
  (0, _react.useEffect)(() => {
    scrollToTab();
  }, [activeKey, transformMin, transformMax, (0, _util.stringify)(activeTabOffset), (0, _util.stringify)(tabOffsets), tabPositionTopOrBottom]);

  // Should recalculate when rtl changed
  (0, _react.useEffect)(() => {
    onListHolderResize();
    // eslint-disable-next-line
  }, [rtl]);

  // ========================= Render ========================
  const hasDropdown = !!hiddenTabs.length;
  const wrapPrefix = `${prefixCls}-nav-wrap`;
  let pingLeft;
  let pingRight;
  let pingTop;
  let pingBottom;
  if (tabPositionTopOrBottom) {
    if (rtl) {
      pingRight = transformLeft > 0;
      pingLeft = transformLeft !== transformMax;
    } else {
      pingLeft = transformLeft < 0;
      pingRight = transformLeft !== transformMin;
    }
  } else {
    pingTop = transformTop < 0;
    pingBottom = transformTop !== transformMin;
  }
  return /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onListHolderResize
  }, /*#__PURE__*/React.createElement("div", {
    ref: (0, _ref.useComposeRef)(ref, containerRef),
    role: "tablist",
    "aria-orientation": tabPositionTopOrBottom ? 'horizontal' : 'vertical',
    className: (0, _clsx.clsx)(`${prefixCls}-nav`, className, tabsClassNames?.header),
    style: {
      ...styles?.header,
      ...style
    },
    onKeyDown: () => {
      // No need animation when use keyboard
      doLockAnimation();
    }
  }, /*#__PURE__*/React.createElement(_ExtraContent.default, {
    ref: extraLeftRef,
    position: "left",
    extra: extra,
    prefixCls: prefixCls
  }), /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onListHolderResize
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(wrapPrefix, {
      [`${wrapPrefix}-ping-left`]: pingLeft,
      [`${wrapPrefix}-ping-right`]: pingRight,
      [`${wrapPrefix}-ping-top`]: pingTop,
      [`${wrapPrefix}-ping-bottom`]: pingBottom
    }),
    ref: tabsWrapperRef
  }, /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onListHolderResize
  }, /*#__PURE__*/React.createElement("div", {
    ref: tabListRef,
    className: `${prefixCls}-nav-list`,
    style: {
      transform: `translate(${transformLeft}px, ${transformTop}px)`,
      transition: lockAnimation ? 'none' : undefined
    }
  }, tabNodes, /*#__PURE__*/React.createElement(_AddButton.default, {
    ref: innerAddButtonRef,
    prefixCls: prefixCls,
    locale: locale,
    editable: editable,
    style: {
      ...(tabNodes.length === 0 ? undefined : tabNodeStyle),
      visibility: hasDropdown ? 'hidden' : null
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-ink-bar`, tabsClassNames?.indicator, {
      [`${prefixCls}-ink-bar-animated`]: animated.inkBar
    }),
    style: {
      ...indicatorStyle,
      ...styles?.indicator
    }
  }))))), /*#__PURE__*/React.createElement(_OperationNode.default, _extends({}, props, {
    removeAriaLabel: locale?.removeAriaLabel,
    ref: operationsRef,
    prefixCls: prefixCls,
    tabs: hiddenTabs,
    className: !hasDropdown && operationsHiddenClassName,
    popupStyle: styles?.popup,
    tabMoving: !!lockAnimation
  })), /*#__PURE__*/React.createElement(_ExtraContent.default, {
    ref: extraRightRef,
    position: "right",
    extra: extra,
    prefixCls: prefixCls
  })));
  /* eslint-enable */
});
var _default = exports.default = TabNavList;