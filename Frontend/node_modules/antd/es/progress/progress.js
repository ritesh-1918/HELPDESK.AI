"use client";

import * as React from 'react';
import { FastColor } from '@ant-design/fast-color';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Circle from './Circle';
import Line from './Line';
import Steps from './Steps';
import useStyle from './style';
import { getSize, getSuccessPercent, validProgress } from './utils';
export const ProgressTypes = ['line', 'circle', 'dashboard'];
const ProgressStatuses = ['normal', 'exception', 'active', 'success'];
const Progress = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    classNames,
    styles,
    steps,
    strokeColor,
    percent = 0,
    size = 'default',
    showInfo = true,
    type = 'line',
    status,
    format,
    style,
    percentPosition = {},
    ...restProps
  } = props;
  // ========================= MISC =========================
  const {
    align: infoAlign = 'end',
    type: infoPosition = 'outer'
  } = percentPosition;
  const strokeColorNotArray = Array.isArray(strokeColor) ? strokeColor[0] : strokeColor;
  const strokeColorNotGradient = typeof strokeColor === 'string' || Array.isArray(strokeColor) ? strokeColor : undefined;
  const strokeColorIsBright = React.useMemo(() => {
    if (strokeColorNotArray) {
      const color = typeof strokeColorNotArray === 'string' ? strokeColorNotArray : Object.values(strokeColorNotArray)[0];
      return new FastColor(color).isLight();
    }
    return false;
  }, [strokeColor]);
  const percentNumber = React.useMemo(() => {
    const successPercent = getSuccessPercent(props);
    return Number.parseInt(successPercent !== undefined ? (successPercent ?? 0)?.toString() : (percent ?? 0)?.toString(), 10);
  }, [percent, props.success]);
  const progressStatus = React.useMemo(() => {
    if (!ProgressStatuses.includes(status) && percentNumber >= 100) {
      return 'success';
    }
    return status || 'normal';
  }, [status, percentNumber]);
  // ======================= Context ========================
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('progress');
  const prefixCls = getPrefixCls('progress', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const mergedProps = {
    ...props,
    percent,
    type,
    size,
    showInfo,
    percentPosition
  };
  // ======================== Styles ========================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ========================= Info =========================
  const isLineType = type === 'line';
  const isPureLineType = isLineType && !steps;
  const progressInfo = React.useMemo(() => {
    if (!showInfo) {
      return null;
    }
    const successPercent = getSuccessPercent(props);
    let text;
    const textFormatter = format || (number => `${number}%`);
    const isBrightInnerColor = isLineType && strokeColorIsBright && infoPosition === 'inner';
    if (infoPosition === 'inner' || format || progressStatus !== 'exception' && progressStatus !== 'success') {
      text = textFormatter(validProgress(percent), validProgress(successPercent));
    } else if (progressStatus === 'exception') {
      text = isLineType ? /*#__PURE__*/React.createElement(CloseCircleFilled, null) : /*#__PURE__*/React.createElement(CloseOutlined, null);
    } else if (progressStatus === 'success') {
      text = isLineType ? /*#__PURE__*/React.createElement(CheckCircleFilled, null) : /*#__PURE__*/React.createElement(CheckOutlined, null);
    }
    return /*#__PURE__*/React.createElement("span", {
      className: clsx(`${prefixCls}-indicator`, {
        [`${prefixCls}-indicator-bright`]: isBrightInnerColor,
        [`${prefixCls}-indicator-${infoAlign}`]: isPureLineType,
        [`${prefixCls}-indicator-${infoPosition}`]: isPureLineType
      }, mergedClassNames.indicator),
      style: mergedStyles.indicator,
      title: typeof text === 'string' ? text : undefined
    }, text);
  }, [showInfo, percent, percentNumber, progressStatus, type, prefixCls, format, isLineType, strokeColorIsBright, infoPosition, infoAlign, isPureLineType, mergedClassNames.indicator, mergedStyles.indicator]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Progress');
    [['width', 'size'], ['trailColor', 'railColor'], ['gapPosition', 'gapPlacement']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    if (type === 'circle' || type === 'dashboard') {
      if (Array.isArray(size)) {
        process.env.NODE_ENV !== "production" ? warning(false, 'usage', 'Type "circle" and "dashboard" do not accept array as `size`, please use number or preset size instead.') : void 0;
      } else if (typeof size === 'object') {
        process.env.NODE_ENV !== "production" ? warning(false, 'usage', 'Type "circle" and "dashboard" do not accept object as `size`, please use number or preset size instead.') : void 0;
      }
    }
  }
  // ======================== Render ========================
  const sharedProps = {
    ...props,
    classNames: mergedClassNames,
    styles: mergedStyles
  };
  let progress;
  // Render progress shape
  if (type === 'line') {
    progress = steps ? (/*#__PURE__*/React.createElement(Steps, {
      ...sharedProps,
      strokeColor: strokeColorNotGradient,
      prefixCls: prefixCls,
      steps: typeof steps === 'object' ? steps.count : steps
    }, progressInfo)) : (/*#__PURE__*/React.createElement(Line, {
      ...sharedProps,
      strokeColor: strokeColorNotArray,
      prefixCls: prefixCls,
      direction: direction,
      percentPosition: {
        align: infoAlign,
        type: infoPosition
      }
    }, progressInfo));
  } else if (type === 'circle' || type === 'dashboard') {
    progress = /*#__PURE__*/React.createElement(Circle, {
      ...sharedProps,
      strokeColor: strokeColorNotArray,
      prefixCls: prefixCls,
      progressStatus: progressStatus
    }, progressInfo);
  }
  const classString = clsx(prefixCls, `${prefixCls}-status-${progressStatus}`, {
    [`${prefixCls}-${type === 'dashboard' && 'circle' || type}`]: type !== 'line',
    [`${prefixCls}-inline-circle`]: type === 'circle' && getSize(size, 'circle')[0] <= 20,
    [`${prefixCls}-line`]: isPureLineType,
    [`${prefixCls}-line-align-${infoAlign}`]: isPureLineType,
    [`${prefixCls}-line-position-${infoPosition}`]: isPureLineType,
    [`${prefixCls}-steps`]: steps,
    [`${prefixCls}-show-info`]: showInfo,
    [`${prefixCls}-${size}`]: typeof size === 'string',
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      ...contextStyle,
      ...mergedStyles.root,
      ...style
    },
    className: classString,
    role: "progressbar",
    "aria-valuenow": percentNumber,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    ...omit(restProps, ['railColor', 'trailColor', 'strokeWidth', 'width', 'gapDegree', 'gapPosition', 'gapPlacement', 'strokeLinecap', 'success'])
  }, progress);
});
if (process.env.NODE_ENV !== 'production') {
  Progress.displayName = 'Progress';
}
export default Progress;