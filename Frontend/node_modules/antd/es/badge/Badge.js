"use client";

import * as React from 'react';
import { useMemo, useRef } from 'react';
import CSSMotion from '@rc-component/motion';
import { clsx } from 'clsx';
import { isPresetColor } from '../_util/colors';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { cloneElement } from '../_util/reactNode';
import { useComponentConfig } from '../config-provider/context';
import ScrollNumber from './ScrollNumber';
import useStyle from './style';
const Badge = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    scrollNumberPrefixCls: customizeScrollNumberPrefixCls,
    children,
    status,
    text,
    color,
    count = null,
    overflowCount = 99,
    dot = false,
    size = 'default',
    title,
    offset,
    style,
    className,
    rootClassName,
    classNames,
    styles,
    showZero = false,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('badge');
  const prefixCls = getPrefixCls('badge', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    overflowCount,
    size,
    dot,
    showZero
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ================================ Misc ================================
  const numberedDisplayCount = count > overflowCount ? `${overflowCount}+` : count;
  const isZero = numberedDisplayCount === '0' || numberedDisplayCount === 0 || text === '0' || text === 0;
  const ignoreCount = count === null || isZero && !showZero;
  const hasStatus = (isNonNullable(status) || isNonNullable(color)) && ignoreCount;
  const hasStatusValue = isNonNullable(status) || !isZero;
  const showAsDot = dot && !isZero;
  const mergedCount = showAsDot ? '' : numberedDisplayCount;
  const isHidden = useMemo(() => {
    const isEmpty = (!isNonNullable(mergedCount) || mergedCount === '') && (!isNonNullable(text) || text === '');
    return (isEmpty || isZero && !showZero) && !showAsDot;
  }, [mergedCount, isZero, showZero, showAsDot, text]);
  // Count should be cache in case hidden change it
  const countRef = useRef(count);
  if (!isHidden) {
    countRef.current = count;
  }
  const livingCount = countRef.current;
  // We need cache count since remove motion should not change count display
  const displayCountRef = useRef(mergedCount);
  if (!isHidden) {
    displayCountRef.current = mergedCount;
  }
  const displayCount = displayCountRef.current;
  // We will cache the dot status to avoid shaking on leaved motion
  const isDotRef = useRef(showAsDot);
  if (!isHidden) {
    isDotRef.current = showAsDot;
  }
  // =============================== Styles ===============================
  const mergedStyle = useMemo(() => {
    if (!offset) {
      return {
        ...contextStyle,
        ...style
      };
    }
    const horizontalOffset = Number.parseInt(offset[0], 10);
    const offsetStyle = {
      marginTop: offset[1],
      insetInlineEnd: -horizontalOffset
    };
    return {
      ...offsetStyle,
      ...contextStyle,
      ...style
    };
  }, [offset, style, contextStyle]);
  // =============================== Render ===============================
  // >>> Title
  const titleNode = title ?? (typeof livingCount === 'string' || typeof livingCount === 'number' ? livingCount : undefined);
  // >>> Status Text
  const showStatusTextNode = !isHidden && (text === 0 ? showZero : !!text && text !== true);
  const statusTextNode = !showStatusTextNode ? null : (/*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-status-text`
  }, text));
  // >>> Display Component
  const displayNode = !livingCount || typeof livingCount !== 'object' ? undefined : cloneElement(livingCount, oriProps => ({
    style: {
      ...mergedStyle,
      ...oriProps.style
    }
  }));
  // InternalColor
  const isInternalColor = isPresetColor(color, false);
  // Shared styles
  const statusCls = clsx(mergedClassNames.indicator, {
    [`${prefixCls}-status-dot`]: hasStatus,
    [`${prefixCls}-status-${status}`]: !!status,
    [`${prefixCls}-color-${color}`]: isInternalColor
  });
  const statusStyle = {};
  if (color && !isInternalColor) {
    statusStyle.color = color;
    statusStyle.background = color;
  }
  const badgeClassName = clsx(prefixCls, {
    [`${prefixCls}-status`]: hasStatus,
    [`${prefixCls}-not-a-wrapper`]: !children,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, contextClassName, mergedClassNames.root, hashId, cssVarCls);
  // <Badge status="success" />
  if (!children && hasStatus && (text || hasStatusValue || !ignoreCount)) {
    const statusTextColor = mergedStyle.color;
    return /*#__PURE__*/React.createElement("span", {
      ref: ref,
      ...restProps,
      className: badgeClassName,
      style: {
        ...mergedStyles.root,
        ...mergedStyle
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: statusCls,
      style: {
        ...mergedStyles.indicator,
        ...statusStyle
      }
    }), showStatusTextNode && (/*#__PURE__*/React.createElement("span", {
      style: {
        color: statusTextColor
      },
      className: `${prefixCls}-status-text`
    }, text)));
  }
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    ...restProps,
    className: badgeClassName,
    style: mergedStyles.root
  }, children, /*#__PURE__*/React.createElement(CSSMotion, {
    visible: !isHidden,
    motionName: `${prefixCls}-zoom`,
    motionAppear: false,
    motionDeadline: 1000
  }, ({
    className: motionClassName
  }) => {
    const scrollNumberPrefixCls = getPrefixCls('scroll-number', customizeScrollNumberPrefixCls);
    const isDot = isDotRef.current;
    const scrollNumberCls = clsx(mergedClassNames.indicator, {
      [`${prefixCls}-dot`]: isDot,
      [`${prefixCls}-count`]: !isDot,
      [`${prefixCls}-count-sm`]: size === 'small',
      [`${prefixCls}-multiple-words`]: !isDot && displayCount && displayCount.toString().length > 1,
      [`${prefixCls}-status-${status}`]: !!status,
      [`${prefixCls}-color-${color}`]: isInternalColor
    });
    let scrollNumberStyle = {
      ...mergedStyles.indicator,
      ...mergedStyle
    };
    if (color && !isInternalColor) {
      scrollNumberStyle = scrollNumberStyle || {};
      scrollNumberStyle.background = color;
    }
    return /*#__PURE__*/React.createElement(ScrollNumber, {
      prefixCls: scrollNumberPrefixCls,
      show: !isHidden,
      motionClassName: motionClassName,
      className: scrollNumberCls,
      count: displayCount,
      title: titleNode,
      style: scrollNumberStyle,
      key: "scrollNumber"
    }, displayNode);
  }), statusTextNode);
});
if (process.env.NODE_ENV !== 'production') {
  Badge.displayName = 'Badge';
}
export default Badge;