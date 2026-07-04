"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { debounce } from 'throttle-debounce';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Indicator from './Indicator';
import useStyle from './style/index';
import usePercent from './usePercent';
const _SpinSizes = ['small', 'default', 'large'];
// Render indicator
let defaultIndicator;
function shouldDelay(spinning, delay) {
  return !!spinning && !!delay && !Number.isNaN(Number(delay));
}
const Spin = props => {
  const {
    prefixCls: customizePrefixCls,
    spinning: customSpinning = true,
    delay = 0,
    className,
    rootClassName,
    size = 'default',
    tip,
    description,
    wrapperClassName,
    style,
    children,
    fullscreen = false,
    indicator,
    percent,
    classNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    indicator: contextIndicator,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('spin');
  const prefixCls = getPrefixCls('spin', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const [spinning, setSpinning] = React.useState(() => customSpinning && !shouldDelay(customSpinning, delay));
  const mergedPercent = usePercent(spinning, percent);
  React.useEffect(() => {
    if (customSpinning) {
      const showSpinning = debounce(delay, () => {
        setSpinning(true);
      });
      showSpinning();
      return () => {
        showSpinning?.cancel?.();
      };
    }
    setSpinning(false);
  }, [delay, customSpinning]);
  // ======================= Description ======================
  const mergedDescription = description ?? tip;
  // =============== Merged Props for Semantic ================
  const mergedProps = {
    ...props,
    size,
    spinning,
    tip: mergedDescription,
    description: mergedDescription,
    fullscreen,
    children,
    percent: mergedPercent
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ======================== Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Spin');
    warning.deprecated(!tip, 'tip', 'description');
    warning.deprecated(!wrapperClassName, 'wrapperClassName', 'classNames.root');
    warning.deprecated(!(mergedClassNames?.tip || mergedStyles?.tip), 'classNames.tip and styles.tip', 'classNames.description and styles.description');
    warning.deprecated(!(mergedClassNames?.mask || mergedStyles?.mask), 'classNames.mask and styles.mask', 'classNames.root and styles.root');
  }
  // ======================= Indicator ========================
  const mergedIndicator = indicator ?? contextIndicator ?? defaultIndicator;
  // ========================= Render =========================
  const hasChildren = typeof children !== 'undefined';
  const isNested = hasChildren || fullscreen;
  const indicatorNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Indicator, {
    className: clsx(mergedClassNames.indicator),
    style: mergedStyles.indicator,
    prefixCls: prefixCls,
    indicator: mergedIndicator,
    percent: mergedPercent
  }), mergedDescription && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, mergedClassNames.tip, mergedClassNames.description),
    style: {
      ...mergedStyles.tip,
      ...mergedStyles.description
    }
  }, mergedDescription)));
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-spinning`]: spinning,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-fullscreen`]: fullscreen
    }, rootClassName, mergedClassNames.root, fullscreen && mergedClassNames.mask, isNested ? wrapperClassName : [`${prefixCls}-section`, mergedClassNames.section], contextClassName, className, hashId, cssVarCls),
    style: {
      ...mergedStyles.root,
      ...(!isNested ? mergedStyles.section : {}),
      ...(fullscreen ? mergedStyles.mask : {}),
      ...contextStyle,
      ...style
    },
    "aria-live": "polite",
    "aria-busy": spinning,
    ...restProps
  }, spinning && (isNested ? (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-section`, mergedClassNames.section),
    style: mergedStyles.section
  }, indicatorNode)) : indicatorNode), hasChildren && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-container`, mergedClassNames.container),
    style: mergedStyles.container
  }, children)));
};
Spin.setDefaultIndicator = indicator => {
  defaultIndicator = indicator;
};
if (process.env.NODE_ENV !== 'production') {
  Spin.displayName = 'Spin';
}
export default Spin;