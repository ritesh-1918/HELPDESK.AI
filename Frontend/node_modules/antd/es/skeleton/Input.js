"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import Element from './Element';
import useStyle from './style';
const SkeletonInput = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    classNames,
    rootClassName,
    active,
    block,
    style,
    styles,
    size = 'default',
    ...rest
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const cls = clsx(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, classNames?.root, className, rootClassName, hashId, cssVarCls);
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: styles?.root
  }, /*#__PURE__*/React.createElement(Element, {
    prefixCls: `${prefixCls}-input`,
    className: classNames?.content,
    style: {
      ...styles?.content,
      ...style
    },
    size: size,
    ...rest
  }));
};
export default SkeletonInput;