"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { useMergeSemantic, useOrientation } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useSize from '../config-provider/hooks/useSize';
import useStyle from './style';
const titlePlacementList = ['left', 'right', 'center', 'start', 'end'];
const sizeClassNameMap = {
  small: 'sm',
  middle: 'md'
};
const Divider = props => {
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('divider');
  const {
    prefixCls: customizePrefixCls,
    type,
    orientation,
    vertical,
    titlePlacement,
    orientationMargin,
    className,
    rootClassName,
    children,
    dashed,
    variant = 'solid',
    plain,
    style,
    size: customSize,
    classNames,
    styles,
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('divider', customizePrefixCls);
  const railCls = `${prefixCls}-rail`;
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const sizeFullName = useSize(customSize);
  const sizeCls = sizeClassNameMap[sizeFullName];
  const hasChildren = !!children;
  const validTitlePlacement = titlePlacementList.includes(orientation || '');
  const mergedTitlePlacement = React.useMemo(() => {
    const placement = titlePlacement ?? (validTitlePlacement ? orientation : 'center');
    if (placement === 'left') {
      return direction === 'rtl' ? 'end' : 'start';
    }
    if (placement === 'right') {
      return direction === 'rtl' ? 'start' : 'end';
    }
    return placement;
  }, [direction, orientation, titlePlacement, validTitlePlacement]);
  const hasMarginStart = mergedTitlePlacement === 'start' && orientationMargin != null;
  const hasMarginEnd = mergedTitlePlacement === 'end' && orientationMargin != null;
  const [mergedOrientation, mergedVertical] = useOrientation(orientation, vertical, type);
  // ========================= Semantic =========================
  const mergedProps = {
    ...props,
    orientation: mergedOrientation,
    titlePlacement: mergedTitlePlacement,
    size: sizeFullName
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const classString = clsx(prefixCls, contextClassName, hashId, cssVarCls, `${prefixCls}-${mergedOrientation}`, {
    [`${prefixCls}-with-text`]: hasChildren,
    [`${prefixCls}-with-text-${mergedTitlePlacement}`]: hasChildren,
    [`${prefixCls}-dashed`]: !!dashed,
    [`${prefixCls}-${variant}`]: variant !== 'solid',
    [`${prefixCls}-plain`]: !!plain,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-no-default-orientation-margin-start`]: hasMarginStart,
    [`${prefixCls}-no-default-orientation-margin-end`]: hasMarginEnd,
    [`${prefixCls}-${sizeCls}`]: !!sizeCls,
    [railCls]: !children,
    [mergedClassNames.rail]: mergedClassNames.rail && !children
  }, className, rootClassName, mergedClassNames.root);
  const memoizedPlacementMargin = React.useMemo(() => {
    if (typeof orientationMargin === 'number') {
      return orientationMargin;
    }
    if (/^\d+$/.test(orientationMargin)) {
      return Number(orientationMargin);
    }
    return orientationMargin;
  }, [orientationMargin]);
  const innerStyle = {
    marginInlineStart: hasMarginStart ? memoizedPlacementMargin : undefined,
    marginInlineEnd: hasMarginEnd ? memoizedPlacementMargin : undefined
  };
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Divider');
    process.env.NODE_ENV !== "production" ? warning(!children || !mergedVertical, 'usage', '`children` not working in `vertical` mode.') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!validTitlePlacement, 'usage', '`orientation` is used for direction, please use `titlePlacement` replace this') : void 0;
    [['type', 'orientation'], ['orientationMargin', 'styles.content.margin']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: classString,
    style: {
      ...contextStyle,
      ...mergedStyles.root,
      ...(children ? {} : mergedStyles.rail),
      ...style
    },
    ...restProps,
    role: "separator"
  }, children && !mergedVertical && (/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: clsx(railCls, `${railCls}-start`, mergedClassNames.rail),
    style: mergedStyles.rail
  }), /*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}-inner-text`, mergedClassNames.content),
    style: {
      ...innerStyle,
      ...mergedStyles.content
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    className: clsx(railCls, `${railCls}-end`, mergedClassNames.rail),
    style: mergedStyles.rail
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  Divider.displayName = 'Divider';
}
export default Divider;