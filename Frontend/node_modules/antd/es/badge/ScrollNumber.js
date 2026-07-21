"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { cloneElement } from '../_util/reactNode';
import { ConfigContext } from '../config-provider';
import SingleNumber from './SingleNumber';
const ScrollNumber = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    count,
    className,
    motionClassName,
    style,
    title,
    show,
    component: Component = 'sup',
    children,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('scroll-number', customizePrefixCls);
  // ============================ Render ============================
  const newProps = {
    ...restProps,
    'data-show': show,
    style,
    className: clsx(prefixCls, className, motionClassName),
    title: title
  };
  // Only integer need motion
  let numberNodes = count;
  if (count && Number(count) % 1 === 0) {
    const numberList = String(count).split('');
    numberNodes = /*#__PURE__*/React.createElement("bdi", null, numberList.map((num, i) => (/*#__PURE__*/React.createElement(SingleNumber, {
      prefixCls: prefixCls,
      count: Number(count),
      value: num,
      // eslint-disable-next-line react/no-array-index-key
      key: numberList.length - i
    }))));
  }
  // allow specify the border
  // mock border-color by box-shadow for compatible with old usage:
  // <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', borderColor: '#d9d9d9' }} />
  if (style?.borderColor) {
    newProps.style = {
      ...style,
      boxShadow: `0 0 0 1px ${style.borderColor} inset`
    };
  }
  if (children) {
    return cloneElement(children, oriProps => ({
      className: clsx(`${prefixCls}-custom-component`, oriProps?.className, motionClassName)
    }));
  }
  return /*#__PURE__*/React.createElement(Component, {
    ...newProps,
    ref: ref
  }, numberNodes);
});
export default ScrollNumber;