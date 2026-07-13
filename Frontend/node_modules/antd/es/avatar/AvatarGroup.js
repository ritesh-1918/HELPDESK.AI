"use client";

import * as React from 'react';
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { cloneElement } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Popover from '../popover';
import Avatar from './Avatar';
import AvatarContext from './AvatarContext';
import useStyle from './style';
const AvatarContextProvider = props => {
  const {
    size,
    shape
  } = React.useContext(AvatarContext);
  const avatarContextValue = React.useMemo(() => ({
    size: props.size || size,
    shape: props.shape || shape
  }), [props.size, props.shape, size, shape]);
  return /*#__PURE__*/React.createElement(AvatarContext.Provider, {
    value: avatarContextValue
  }, props.children);
};
const AvatarGroup = props => {
  const {
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    maxCount,
    maxStyle,
    size,
    shape,
    maxPopoverPlacement,
    maxPopoverTrigger,
    children,
    max
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Avatar.Group');
    [['maxCount', 'max={{ count: number }}'], ['maxStyle', 'max={{ style: CSSProperties }}'], ['maxPopoverPlacement', 'max={{ popover: PopoverProps }}'], ['maxPopoverTrigger', 'max={{ popover: PopoverProps }}']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const prefixCls = getPrefixCls('avatar', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const cls = clsx(groupPrefixCls, {
    [`${groupPrefixCls}-rtl`]: direction === 'rtl'
  }, cssVarCls, rootCls, className, rootClassName, hashId);
  const childrenWithProps = toArray(children).map((child, index) => cloneElement(child, {
    // eslint-disable-next-line react/no-array-index-key
    key: `avatar-key-${index}`
  }));
  const mergeCount = max?.count || maxCount;
  const numOfChildren = childrenWithProps.length;
  if (mergeCount && mergeCount < numOfChildren) {
    const childrenShow = childrenWithProps.slice(0, mergeCount);
    const childrenHidden = childrenWithProps.slice(mergeCount, numOfChildren);
    const mergeStyle = max?.style || maxStyle;
    const mergePopoverTrigger = max?.popover?.trigger || maxPopoverTrigger || 'hover';
    const mergePopoverPlacement = max?.popover?.placement || maxPopoverPlacement || 'top';
    const popoverProps = {
      content: childrenHidden,
      ...max?.popover,
      placement: mergePopoverPlacement,
      trigger: mergePopoverTrigger,
      rootClassName: clsx(`${groupPrefixCls}-popover`, max?.popover?.rootClassName)
    };
    childrenShow.push(/*#__PURE__*/React.createElement(Popover, {
      key: "avatar-popover-key",
      destroyOnHidden: true,
      ...popoverProps
    }, /*#__PURE__*/React.createElement(Avatar, {
      style: mergeStyle
    }, `+${numOfChildren - mergeCount}`)));
    return /*#__PURE__*/React.createElement(AvatarContextProvider, {
      shape: shape,
      size: size
    }, /*#__PURE__*/React.createElement("div", {
      className: cls,
      style: style
    }, childrenShow));
  }
  return /*#__PURE__*/React.createElement(AvatarContextProvider, {
    shape: shape,
    size: size
  }, /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: style
  }, childrenWithProps));
};
export default AvatarGroup;