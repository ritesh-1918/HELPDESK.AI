"use client";

import * as React from 'react';
import { Circle as RCCircle } from '@rc-component/progress';
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { useComponentConfig } from '../config-provider/context';
import Tooltip from '../tooltip';
import { getPercentage, getSize, getStrokeColor } from './utils';
const CIRCLE_MIN_STROKE_WIDTH = 3;
const getMinPercent = width => CIRCLE_MIN_STROKE_WIDTH / width * 100;
const OMIT_SEMANTIC_NAMES = ['root', 'body', 'indicator'];
const Circle = props => {
  const {
    prefixCls,
    classNames,
    styles,
    railColor,
    trailColor,
    strokeLinecap = 'round',
    gapPosition,
    gapPlacement,
    gapDegree,
    width: originWidth = 120,
    type,
    children,
    success,
    size = originWidth,
    steps
  } = props;
  const {
    direction
  } = useComponentConfig('progress');
  const mergedRailColor = railColor ?? trailColor;
  const [width, height] = getSize(size, 'circle');
  let {
    strokeWidth
  } = props;
  if (strokeWidth === undefined) {
    strokeWidth = Math.max(getMinPercent(width), 6);
  }
  const circleStyle = {
    width,
    height,
    fontSize: width * 0.15 + 6
  };
  const realGapDegree = React.useMemo(() => {
    // Support gapDeg = 0 when type = 'dashboard'
    if (gapDegree || gapDegree === 0) {
      return gapDegree;
    }
    if (type === 'dashboard') {
      return 75;
    }
    return undefined;
  }, [gapDegree, type]);
  const percentArray = getPercentage(props);
  const gapPos = React.useMemo(() => {
    const mergedPlacement = (gapPlacement ?? gapPosition) || type === 'dashboard' && 'bottom' || undefined;
    const isRTL = direction === 'rtl';
    switch (mergedPlacement) {
      case 'start':
        return isRTL ? 'right' : 'left';
      case 'end':
        return isRTL ? 'left' : 'right';
      default:
        return mergedPlacement;
    }
  }, [direction, gapPlacement, gapPosition, type]);
  // using className to style stroke color
  const isGradient = Object.prototype.toString.call(props.strokeColor) === '[object Object]';
  const strokeColor = getStrokeColor({
    success,
    strokeColor: props.strokeColor
  });
  const wrapperClassName = clsx(`${prefixCls}-body`, {
    [`${prefixCls}-circle-gradient`]: isGradient
  }, classNames.body);
  const circleContent = /*#__PURE__*/React.createElement(RCCircle, {
    steps: steps,
    percent: steps ? percentArray[1] : percentArray,
    strokeWidth: strokeWidth,
    railWidth: strokeWidth,
    strokeColor: steps ? strokeColor[1] : strokeColor,
    strokeLinecap: strokeLinecap,
    railColor: mergedRailColor,
    prefixCls: prefixCls,
    gapDegree: realGapDegree,
    gapPosition: gapPos,
    classNames: omit(classNames, OMIT_SEMANTIC_NAMES),
    styles: omit(styles, OMIT_SEMANTIC_NAMES)
  });
  const smallCircle = width <= 20;
  const node = /*#__PURE__*/React.createElement("div", {
    className: wrapperClassName,
    style: {
      ...circleStyle,
      ...styles.body
    }
  }, circleContent, !smallCircle && children);
  if (smallCircle) {
    return /*#__PURE__*/React.createElement(Tooltip, {
      title: children
    }, node);
  }
  return node;
};
export default Circle;