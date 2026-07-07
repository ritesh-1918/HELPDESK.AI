"use client";

import React from 'react';
import RcSlider from '@rc-component/slider';
import raf from "@rc-component/util/es/raf";
import { clsx } from 'clsx';
import { useMergeSemantic, useOrientation } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import DisabledContext from '../config-provider/DisabledContext';
import SliderInternalContext from './Context';
import SliderTooltip from './SliderTooltip';
import useStyle from './style';
import useRafLock from './useRafLock';
function getTipFormatter(tipFormatter) {
  if (tipFormatter || tipFormatter === null) {
    return tipFormatter;
  }
  return val => typeof val === 'number' ? val.toString() : '';
}
const Slider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    range,
    className,
    rootClassName,
    style,
    disabled,
    // Deprecated Props
    tooltip = {},
    onChangeComplete,
    classNames,
    styles,
    vertical,
    orientation,
    ...restProps
  } = props;
  const [, mergedVertical] = useOrientation(orientation, vertical);
  const {
    getPrefixCls,
    direction: contextDirection,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    getPopupContainer
  } = useComponentConfig('slider');
  const contextDisabled = React.useContext(DisabledContext);
  const mergedDisabled = disabled ?? contextDisabled;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    disabled: mergedDisabled,
    vertical: mergedVertical
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Context ==============================
  const {
    handleRender: contextHandleRender,
    direction: internalContextDirection
  } = React.useContext(SliderInternalContext);
  const mergedDirection = internalContextDirection || contextDirection;
  const isRTL = mergedDirection === 'rtl';
  // =============================== Open ===============================
  const [hoverOpen, setHoverOpen] = useRafLock();
  const [focusOpen, setFocusOpen] = useRafLock();
  const tooltipProps = {
    ...tooltip
  };
  const {
    open: tooltipOpen,
    placement: tooltipPlacement,
    getPopupContainer: getTooltipPopupContainer,
    prefixCls: customizeTooltipPrefixCls,
    formatter: tipFormatter
  } = tooltipProps;
  const lockOpen = tooltipOpen;
  const activeOpen = (hoverOpen || focusOpen) && lockOpen !== false;
  const mergedTipFormatter = getTipFormatter(tipFormatter);
  // ============================= Change ==============================
  const [dragging, setDragging] = useRafLock();
  const onInternalChangeComplete = nextValues => {
    onChangeComplete?.(nextValues);
    setDragging(false);
  };
  // ============================ Placement ============================
  const getTooltipPlacement = (placement, vert) => {
    if (placement) {
      return placement;
    }
    if (!vert) {
      return 'top';
    }
    return isRTL ? 'left' : 'right';
  };
  // ============================== Style ===============================
  const prefixCls = getPrefixCls('slider', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const rootClassNames = clsx(className, contextClassName, mergedClassNames.root, rootClassName, {
    [`${prefixCls}-rtl`]: isRTL,
    [`${prefixCls}-lock`]: dragging
  }, hashId, cssVarCls);
  // make reverse default on rtl direction
  if (isRTL && !mergedVertical) {
    restProps.reverse = !restProps.reverse;
  }
  // ============================= Warning ==============================
  // Warning for deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Slider');
    [['tooltipPrefixCls', 'prefixCls'], ['getTooltipPopupContainer', 'getPopupContainer'], ['tipFormatter', 'formatter'], ['tooltipPlacement', 'placement'], ['tooltipVisible', 'open']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, `tooltip.${newName}`);
    });
  }
  // ============================== Handle ==============================
  React.useEffect(() => {
    const onMouseUp = () => {
      // Delay for 1 frame to make the click to enable hide tooltip
      // even when the handle is focused
      raf(() => {
        setFocusOpen(false);
      }, 1);
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  const useActiveTooltipHandle = range && !lockOpen;
  const handleRender = contextHandleRender || ((node, info) => {
    const {
      index
    } = info;
    const nodeProps = node.props;
    function proxyEvent(eventName, event, triggerRestPropsEvent) {
      if (triggerRestPropsEvent) {
        restProps[eventName]?.(event);
      }
      nodeProps[eventName]?.(event);
    }
    const passedProps = {
      ...nodeProps,
      onMouseEnter: e => {
        setHoverOpen(true);
        proxyEvent('onMouseEnter', e);
      },
      onMouseLeave: e => {
        setHoverOpen(false);
        proxyEvent('onMouseLeave', e);
      },
      onMouseDown: e => {
        setFocusOpen(true);
        setDragging(true);
        proxyEvent('onMouseDown', e);
      },
      onFocus: e => {
        setFocusOpen(true);
        restProps.onFocus?.(e);
        proxyEvent('onFocus', e, true);
      },
      onBlur: e => {
        setFocusOpen(false);
        restProps.onBlur?.(e);
        proxyEvent('onBlur', e, true);
      }
    };
    const cloneNode = /*#__PURE__*/React.cloneElement(node, passedProps);
    const open = (!!lockOpen || activeOpen) && mergedTipFormatter !== null;
    // Wrap on handle with Tooltip when is single mode or multiple with all show tooltip
    if (!useActiveTooltipHandle) {
      return /*#__PURE__*/React.createElement(SliderTooltip, {
        ...tooltipProps,
        prefixCls: getPrefixCls('tooltip', customizeTooltipPrefixCls),
        title: mergedTipFormatter ? mergedTipFormatter(info.value) : '',
        value: info.value,
        open: open,
        placement: getTooltipPlacement(tooltipPlacement, mergedVertical),
        key: index,
        classNames: {
          root: `${prefixCls}-tooltip`
        },
        getPopupContainer: getTooltipPopupContainer || getPopupContainer
      }, cloneNode);
    }
    return cloneNode;
  });
  // ========================== Active Handle ===========================
  const activeHandleRender = useActiveTooltipHandle ? (handle, info) => {
    const cloneNode = /*#__PURE__*/React.cloneElement(handle, {
      style: {
        ...handle.props.style,
        visibility: 'hidden'
      }
    });
    return /*#__PURE__*/React.createElement(SliderTooltip, {
      ...tooltipProps,
      prefixCls: getPrefixCls('tooltip', customizeTooltipPrefixCls),
      title: mergedTipFormatter ? mergedTipFormatter(info.value) : '',
      open: mergedTipFormatter !== null && activeOpen,
      placement: getTooltipPlacement(tooltipPlacement, mergedVertical),
      key: "tooltip",
      classNames: {
        root: `${prefixCls}-tooltip`
      },
      getPopupContainer: getTooltipPopupContainer || getPopupContainer,
      draggingDelete: info.draggingDelete
    }, cloneNode);
  } : undefined;
  // ============================== Render ==============================
  const rootStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return (
    /*#__PURE__*/
    // @ts-ignore
    React.createElement(RcSlider, {
      ...restProps,
      classNames: mergedClassNames,
      styles: mergedStyles,
      step: restProps.step,
      range: range,
      className: rootClassNames,
      style: rootStyle,
      disabled: mergedDisabled,
      vertical: mergedVertical,
      ref: ref,
      prefixCls: prefixCls,
      handleRender: handleRender,
      activeHandleRender: activeHandleRender,
      onChangeComplete: onInternalChangeComplete
    })
  );
});
if (process.env.NODE_ENV !== 'production') {
  Slider.displayName = 'Slider';
}
export default Slider;