"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { cloneElement } from '../../_util/reactNode';
import Looper from './Looper';
export default function Indicator(props) {
  const {
    prefixCls,
    indicator,
    percent,
    className,
    style
  } = props;
  const dotClassName = `${prefixCls}-dot`;
  if (indicator && /*#__PURE__*/React.isValidElement(indicator)) {
    return cloneElement(indicator, currentProps => ({
      className: clsx(currentProps.className, dotClassName, className),
      style: {
        ...currentProps.style,
        ...style
      },
      percent
    }));
  }
  return /*#__PURE__*/React.createElement(Looper, {
    prefixCls: prefixCls,
    percent: percent,
    className: className,
    style: style
  });
}