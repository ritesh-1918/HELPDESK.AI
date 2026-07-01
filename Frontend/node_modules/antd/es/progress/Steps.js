"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { getSize } from './utils';
const Steps = props => {
  const {
    classNames,
    styles,
    size,
    steps,
    rounding: customRounding = Math.round,
    percent = 0,
    strokeWidth = 8,
    strokeColor,
    railColor,
    trailColor,
    prefixCls,
    children
  } = props;
  const current = customRounding(steps * (percent / 100));
  const stepWidth = size === 'small' ? 2 : 14;
  const mergedSize = size ?? [stepWidth, strokeWidth];
  const [width, height] = getSize(mergedSize, 'step', {
    steps,
    strokeWidth
  });
  const unitWidth = width / steps;
  const styledSteps = Array.from({
    length: steps
  });
  const mergedRailColor = railColor ?? trailColor;
  for (let i = 0; i < steps; i++) {
    const color = Array.isArray(strokeColor) ? strokeColor[i] : strokeColor;
    styledSteps[i] = /*#__PURE__*/React.createElement("div", {
      key: i,
      className: clsx(`${prefixCls}-steps-item`, {
        [`${prefixCls}-steps-item-active`]: i <= current - 1
      }, classNames.track),
      style: {
        backgroundColor: i <= current - 1 ? color : mergedRailColor,
        width: unitWidth,
        height,
        ...styles.track
      }
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-steps-body`, classNames.body),
    style: styles.body
  }, styledSteps, children);
};
export default Steps;