"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "OverflowContext", {
  enumerable: true,
  get: function () {
    return _context.OverflowContext;
  }
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _clsx = require("clsx");
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _Item = _interopRequireDefault(require("./Item"));
var _useEffectState = _interopRequireWildcard(require("./hooks/useEffectState"));
var _RawItem = _interopRequireDefault(require("./RawItem"));
var _context = require("./context");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const RESPONSIVE = 'responsive';
const INVALIDATE = 'invalidate';
function defaultRenderRest(omittedItems) {
  return `+ ${omittedItems.length} ...`;
}
function Overflow(props, ref) {
  const {
    prefixCls = 'rc-overflow',
    data = [],
    renderItem,
    renderRawItem,
    itemKey,
    itemWidth = 10,
    ssr,
    style,
    className,
    maxCount,
    renderRest,
    renderRawRest,
    prefix,
    suffix,
    component: Component = 'div',
    itemComponent,
    onVisibleChange,
    ...restProps
  } = props;
  const fullySSR = ssr === 'full';
  const notifyEffectUpdate = (0, _useEffectState.useBatcher)();
  const [containerWidth, setContainerWidth] = (0, _useEffectState.default)(notifyEffectUpdate, null);
  const mergedContainerWidth = containerWidth || 0;
  const [itemWidths, setItemWidths] = (0, _useEffectState.default)(notifyEffectUpdate, new Map());
  const [prevRestWidth, setPrevRestWidth] = (0, _useEffectState.default)(notifyEffectUpdate, 0);
  const [restWidth, setRestWidth] = (0, _useEffectState.default)(notifyEffectUpdate, 0);
  const [prefixWidth, setPrefixWidth] = (0, _useEffectState.default)(notifyEffectUpdate, 0);
  const [suffixWidth, setSuffixWidth] = (0, _useEffectState.default)(notifyEffectUpdate, 0);
  const [suffixFixedStart, setSuffixFixedStart] = (0, _react.useState)(null);
  const [displayCount, setDisplayCount] = (0, _react.useState)(null);
  const mergedDisplayCount = React.useMemo(() => {
    if (displayCount === null && fullySSR) {
      return Number.MAX_SAFE_INTEGER;
    }
    return displayCount || 0;
  }, [displayCount, containerWidth]);
  const [restReady, setRestReady] = (0, _react.useState)(false);
  const itemPrefixCls = `${prefixCls}-item`;

  // Always use the max width to avoid blink
  const mergedRestWidth = Math.max(prevRestWidth, restWidth);

  // ================================= Data =================================
  const isResponsive = maxCount === RESPONSIVE;
  const shouldResponsive = data.length && isResponsive;
  const invalidate = maxCount === INVALIDATE;

  /**
   * When is `responsive`, we will always render rest node to get the real width of it for calculation
   */
  const showRest = shouldResponsive || typeof maxCount === 'number' && data.length > maxCount;
  const mergedData = (0, _react.useMemo)(() => {
    let items = data;
    if (shouldResponsive) {
      if (containerWidth === null && fullySSR) {
        items = data;
      } else {
        items = data.slice(0, Math.min(data.length, mergedContainerWidth / itemWidth));
      }
    } else if (typeof maxCount === 'number') {
      items = data.slice(0, maxCount);
    }
    return items;
  }, [data, itemWidth, containerWidth, maxCount, shouldResponsive]);
  const omittedItems = (0, _react.useMemo)(() => {
    if (shouldResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, shouldResponsive, mergedDisplayCount]);

  // ================================= Item =================================
  const getKey = (0, _react.useCallback)((item, index) => {
    if (typeof itemKey === 'function') {
      return itemKey(item);
    }
    return (itemKey && item?.[itemKey]) ?? index;
  }, [itemKey]);
  const mergedRenderItem = (0, _react.useCallback)(renderItem || (item => item), [renderItem]);
  function updateDisplayCount(count, suffixFixedStartVal, notReady) {
    // React 18 will sync render even when the value is same in some case.
    // We take `mergedData` as deps which may cause dead loop if it's dynamic generate.
    // ref: https://github.com/ant-design/ant-design/issues/36559
    if (displayCount === count && (suffixFixedStartVal === undefined || suffixFixedStartVal === suffixFixedStart)) {
      return;
    }
    setDisplayCount(count);
    if (!notReady) {
      setRestReady(count < data.length - 1);
      onVisibleChange?.(count);
    }
    if (suffixFixedStartVal !== undefined) {
      setSuffixFixedStart(suffixFixedStartVal);
    }
  }

  // ================================= Size =================================
  function onOverflowResize(_, element) {
    setContainerWidth(element.clientWidth);
  }
  function registerSize(key, width) {
    setItemWidths(origin => {
      const clone = new Map(origin);
      if (width === null) {
        clone.delete(key);
      } else {
        clone.set(key, width);
      }
      return clone;
    });
  }
  function registerOverflowSize(_, width) {
    setRestWidth(width);
    setPrevRestWidth(restWidth);
  }
  function registerPrefixSize(_, width) {
    setPrefixWidth(width);
  }
  function registerSuffixSize(_, width) {
    setSuffixWidth(width);
  }

  // ================================ Effect ================================
  function getItemWidth(index) {
    return itemWidths.get(getKey(mergedData[index], index));
  }
  (0, _useLayoutEffect.default)(() => {
    if (mergedContainerWidth && typeof mergedRestWidth === 'number' && mergedData) {
      let totalWidth = prefixWidth + suffixWidth;
      const len = mergedData.length;
      const lastIndex = len - 1;

      // When data count change to 0, reset this since not loop will reach
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }
      for (let i = 0; i < len; i += 1) {
        let currentItemWidth = getItemWidth(i);

        // Fully will always render
        if (fullySSR) {
          currentItemWidth = currentItemWidth || 0;
        }

        // Break since data not ready
        if (currentItemWidth === undefined) {
          updateDisplayCount(i - 1, undefined, true);
          break;
        }

        // Find best match
        totalWidth += currentItemWidth;
        if (
        // Only one means `totalWidth` is the final width
        lastIndex === 0 && totalWidth <= mergedContainerWidth ||
        // Last two width will be the final width
        i === lastIndex - 1 && totalWidth + getItemWidth(lastIndex) <= mergedContainerWidth) {
          // Additional check if match the end
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth > mergedContainerWidth) {
          // Can not hold all the content to show rest
          updateDisplayCount(i - 1, totalWidth - currentItemWidth - suffixWidth + restWidth);
          break;
        }
      }
      if (suffix && getItemWidth(0) + suffixWidth > mergedContainerWidth) {
        setSuffixFixedStart(null);
      }
    }
  }, [mergedContainerWidth, itemWidths, restWidth, prefixWidth, suffixWidth, getKey, mergedData]);

  // ================================ Render ================================
  const displayRest = restReady && !!omittedItems.length;
  let suffixStyle = {};
  if (suffixFixedStart !== null && shouldResponsive) {
    suffixStyle = {
      position: 'absolute',
      left: suffixFixedStart,
      top: 0
    };
  }
  const itemSharedProps = {
    prefixCls: itemPrefixCls,
    responsive: shouldResponsive,
    component: itemComponent,
    invalidate
  };

  // >>>>> Choice render fun by `renderRawItem`
  const internalRenderItemNode = renderRawItem ? (item, index) => {
    const key = getKey(item, index);
    return /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
      key: key,
      value: {
        ...itemSharedProps,
        order: index,
        item,
        itemKey: key,
        registerSize,
        display: index <= mergedDisplayCount
      }
    }, renderRawItem(item, index));
  } : (item, index) => {
    const key = getKey(item, index);
    return /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, {
      order: index,
      key: key,
      item: item,
      renderItem: mergedRenderItem,
      itemKey: key,
      registerSize: registerSize,
      display: index <= mergedDisplayCount
    }));
  };

  // >>>>> Rest node
  const restContextProps = {
    order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
    className: `${itemPrefixCls}-rest`,
    registerSize: registerOverflowSize,
    display: displayRest
  };
  const mergedRenderRest = renderRest || defaultRenderRest;
  const restNode = renderRawRest ? /*#__PURE__*/React.createElement(_context.OverflowContext.Provider, {
    value: {
      ...itemSharedProps,
      ...restContextProps
    }
  }, renderRawRest(omittedItems)) : /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, restContextProps), typeof mergedRenderRest === 'function' ? mergedRenderRest(omittedItems) : mergedRenderRest);
  const overflowNode = /*#__PURE__*/React.createElement(Component, (0, _extends2.default)({
    className: (0, _clsx.clsx)(!invalidate && prefixCls, className),
    style: style,
    ref: ref
  }, restProps), prefix && /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: -1,
    className: `${itemPrefixCls}-prefix`,
    registerSize: registerPrefixSize,
    display: true
  }), prefix), mergedData.map(internalRenderItemNode), showRest ? restNode : null, suffix && /*#__PURE__*/React.createElement(_Item.default, (0, _extends2.default)({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: mergedDisplayCount,
    className: `${itemPrefixCls}-suffix`,
    registerSize: registerSuffixSize,
    display: true,
    style: suffixStyle
  }), suffix));
  return isResponsive ? /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: onOverflowResize,
    disabled: !shouldResponsive
  }, overflowNode) : overflowNode;
}
const ForwardOverflow = /*#__PURE__*/React.forwardRef(Overflow);
ForwardOverflow.Item = _RawItem.default;
ForwardOverflow.RESPONSIVE = RESPONSIVE;
ForwardOverflow.INVALIDATE = INVALIDATE;
if (process.env.NODE_ENV !== 'production') {
  ForwardOverflow.displayName = 'Overflow';
}

// Convert to generic type
var _default = exports.default = ForwardOverflow;