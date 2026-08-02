"use client";

import React, { useState } from 'react';
import { clsx } from 'clsx';
import InputNumber from '../../input-number';
const ColorSteppers = ({
  prefixCls,
  min = 0,
  max = 100,
  value,
  onChange,
  className,
  formatter
}) => {
  const colorSteppersPrefixCls = `${prefixCls}-steppers`;
  const [internalValue, setInternalValue] = useState(0);
  const stepValue = !Number.isNaN(value) ? value : internalValue;
  return /*#__PURE__*/React.createElement(InputNumber, {
    className: clsx(colorSteppersPrefixCls, className),
    min: min,
    max: max,
    value: stepValue,
    formatter: formatter,
    size: "small",
    onChange: step => {
      setInternalValue(step || 0);
      onChange?.(step);
    }
  });
};
export default ColorSteppers;