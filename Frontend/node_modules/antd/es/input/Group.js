"use client";

import * as React from 'react';
import { useContext, useMemo } from 'react';
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { FormItemInputContext } from '../form/context';
import Space from '../space';
import useStyle from './style';
/** @deprecated Please use `Space.Compact` */
const Group = props => {
  const {
    getPrefixCls,
    direction
  } = useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className
  } = props;
  const prefixCls = getPrefixCls('input-group', customizePrefixCls);
  const inputPrefixCls = getPrefixCls('input');
  const [hashId, cssVarCls] = useStyle(inputPrefixCls);
  const cls = clsx(prefixCls, cssVarCls, {
    [`${prefixCls}-lg`]: props.size === 'large',
    [`${prefixCls}-sm`]: props.size === 'small',
    [`${prefixCls}-compact`]: props.compact,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, className);
  const formItemContext = useContext(FormItemInputContext);
  const groupFormItemContext = useMemo(() => ({
    ...formItemContext,
    isFormItemInput: false
  }), [formItemContext]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Input.Group');
    warning.deprecated(false, 'Input.Group', 'Space.Compact');
  }
  return /*#__PURE__*/React.createElement(FormItemInputContext.Provider, {
    value: groupFormItemContext
  }, /*#__PURE__*/React.createElement(Space.Compact, {
    className: cls,
    style: props.style,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onFocus: props.onFocus,
    onBlur: props.onBlur
  }, props.children));
};
export default Group;