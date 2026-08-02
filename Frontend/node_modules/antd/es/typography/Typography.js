"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { useComponentConfig } from '../config-provider/context';
import useStyle from './style';
const Typography = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    component: Component = 'article',
    className,
    rootClassName,
    children,
    direction: typographyDirection,
    style,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction: contextDirection,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('typography');
  const direction = typographyDirection ?? contextDirection;
  const prefixCls = getPrefixCls('typography', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const componentClassName = clsx(prefixCls, contextClassName, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, hashId, cssVarCls);
  const mergedStyle = {
    ...contextStyle,
    ...style
  };
  return (
    /*#__PURE__*/
    // @ts-expect-error: Expression produces a union type that is too complex to represent.
    React.createElement(Component, {
      className: componentClassName,
      style: mergedStyle,
      ref: ref,
      ...restProps
    }, children)
  );
});
if (process.env.NODE_ENV !== 'production') {
  Typography.displayName = 'Typography';
}
export default Typography;