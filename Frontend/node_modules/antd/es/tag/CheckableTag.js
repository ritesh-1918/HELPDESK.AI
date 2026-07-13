"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import DisabledContext from '../config-provider/DisabledContext';
import useStyle from './style';
const CheckableTag = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    style,
    className,
    checked,
    children,
    icon,
    onChange,
    onClick,
    disabled: customDisabled,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    tag
  } = React.useContext(ConfigContext);
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  const handleClick = e => {
    if (mergedDisabled) {
      return;
    }
    onChange?.(!checked);
    onClick?.(e);
  };
  const prefixCls = getPrefixCls('tag', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const cls = clsx(prefixCls, `${prefixCls}-checkable`, {
    [`${prefixCls}-checkable-checked`]: checked,
    [`${prefixCls}-checkable-disabled`]: mergedDisabled
  }, tag?.className, className, hashId, cssVarCls);
  return /*#__PURE__*/React.createElement("span", {
    ...restProps,
    ref: ref,
    style: {
      ...style,
      ...tag?.style
    },
    className: cls,
    onClick: handleClick
  }, icon, /*#__PURE__*/React.createElement("span", null, children));
});
export default CheckableTag;