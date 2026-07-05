import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import ResizeObserver from '@rc-component/resize-observer';
import useLayoutEffect from "@rc-component/util/es/hooks/useLayoutEffect";
import Item from "./Item";
import useEffectState, { useBatcher } from "./hooks/useEffectState";
import RawItem from "./RawItem";
import { OverflowContext } from "./context";
const RESPONSIVE = 'responsive';
const INVALIDATE = 'invalidate';
export { OverflowContext } from "./context";
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
  const notifyEffectUpdate = useBatcher();
  const [containerWidth, setContainerWidth] = useEffectState(notifyEffectUpdate, null);
  const mergedContainerWidth = containerWidth || 0;
  const [itemWidths, setItemWidths] = useEffectState(notifyEffectUpdate, new Map());
  const [prevRestWidth, setPrevRestWidth] = useEffectState(notifyEffectUpdate, 0);
  const [restWidth, setRestWidth] = useEffectState(notifyEffectUpdate, 0);
  const [prefixWidth, setPrefixWidth] = useEffectState(notifyEffectUpdate, 0);
  const [suffixWidth, setSuffixWidth] = useEffectState(notifyEffectUpdate, 0);
  const [suffixFixedStart, setSuffixFixedStart] = useState(null);
  const [displayCount, setDisplayCount] = useState(null);
  const mergedDisplayCount = React.useMemo(() => {
    if (displayCount === null && fullySSR) {
      return Number.MAX_SAFE_INTEGER;
    }
    return displayCount || 0;
  }, [displayCount, containerWidth]);
  const [restReady, setRestReady] = useState(false);
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
  const mergedData = useMemo(() => {
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
  const omittedItems = useMemo(() => {
    if (shouldResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, shouldResponsive, mergedDisplayCount]);

  // ================================= Item =================================
  const getKey = useCallback((item, index) => {
    if (typeof itemKey === 'function') {
      return itemKey(item);
    }
    return (itemKey && item?.[itemKey]) ?? index;
  }, [itemKey]);
  const mergedRenderItem = useCallback(renderItem || (item => item), [renderItem]);
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
  useLayoutEffect(() => {
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
    return /*#__PURE__*/React.createElement(OverflowContext.Provider, {
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
    return /*#__PURE__*/React.createElement(Item, _extends({}, itemSharedProps, {
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
  const restNode = renderRawRest ? /*#__PURE__*/React.createElement(OverflowContext.Provider, {
    value: {
      ...itemSharedProps,
      ...restContextProps
    }
  }, renderRawRest(omittedItems)) : /*#__PURE__*/React.createElement(Item, _extends({}, itemSharedProps, restContextProps), typeof mergedRenderRest === 'function' ? mergedRenderRest(omittedItems) : mergedRenderRest);
  const overflowNode = /*#__PURE__*/React.createElement(Component, _extends({
    className: clsx(!invalidate && prefixCls, className),
    style: style,
    ref: ref
  }, restProps), prefix && /*#__PURE__*/React.createElement(Item, _extends({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: -1,
    className: `${itemPrefixCls}-prefix`,
    registerSize: registerPrefixSize,
    display: true
  }), prefix), mergedData.map(internalRenderItemNode), showRest ? restNode : null, suffix && /*#__PURE__*/React.createElement(Item, _extends({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: mergedDisplayCount,
    className: `${itemPrefixCls}-suffix`,
    registerSize: registerSuffixSize,
    display: true,
    style: suffixStyle
  }), suffix));
  return isResponsive ? /*#__PURE__*/React.createElement(ResizeObserver, {
    onResize: onOverflowResize,
    disabled: !shouldResponsive
  }, overflowNode) : overflowNode;
}
const ForwardOverflow = /*#__PURE__*/React.forwardRef(Overflow);
ForwardOverflow.Item = RawItem;
ForwardOverflow.RESPONSIVE = RESPONSIVE;
ForwardOverflow.INVALIDATE = INVALIDATE;
if (process.env.NODE_ENV !== 'production') {
  ForwardOverflow.displayName = 'Overflow';
}

// Convert to generic type
export default ForwardOverflow;