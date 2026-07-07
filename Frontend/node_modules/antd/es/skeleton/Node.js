"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import useStyle from './style';
const SkeletonNode = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    classNames,
    rootClassName,
    internalClassName,
    style,
    styles,
    active,
    children
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const cls = clsx(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, hashId, classNames?.root, className, rootClassName, cssVarCls);
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: styles?.root
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(classNames?.content, internalClassName || `${prefixCls}-node`),
    style: {
      ...styles?.content,
      ...style
    }
  }, children));
};
export default SkeletonNode;