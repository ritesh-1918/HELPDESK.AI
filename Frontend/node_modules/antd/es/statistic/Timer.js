"use client";

import * as React from 'react';
import { useEvent } from '@rc-component/util';
import { cloneElement } from '../_util/reactNode';
import Statistic from './Statistic';
import { formatCounter } from './utils';
const UPDATE_INTERVAL = 1000 / 60;
function getTime(value) {
  return new Date(value).getTime();
}
const StatisticTimer = props => {
  const {
    value,
    format = 'HH:mm:ss',
    onChange,
    onFinish,
    type,
    ...rest
  } = props;
  const down = type === 'countdown';
  // We reuse state here to do same as `forceUpdate`
  const [showTime, setShowTime] = React.useState(null);
  // ======================== Update ========================
  const update = useEvent(() => {
    const now = Date.now();
    const timestamp = getTime(value);
    setShowTime({});
    const timeDiff = !down ? now - timestamp : timestamp - now;
    onChange?.(timeDiff);
    // Only countdown will trigger `onFinish`
    if (down && timestamp < now) {
      onFinish?.();
      return false;
    }
    return true;
  });
  // Effect trigger
  React.useEffect(() => {
    let intervalId;
    const tick = () => {
      if (!update()) {
        window.clearInterval(intervalId);
      }
    };
    const startTimer = () => {
      intervalId = window.setInterval(tick, UPDATE_INTERVAL);
    };
    const stopTimer = () => {
      window.clearInterval(intervalId);
    };
    startTimer();
    return () => {
      stopTimer();
    };
  }, [value, down]);
  React.useEffect(() => {
    setShowTime({});
  }, []);
  // ======================== Format ========================
  const formatter = (formatValue, config) => showTime ? formatCounter(formatValue, {
    ...config,
    format
  }, down) : '-';
  const valueRender = node => cloneElement(node, {
    title: undefined
  });
  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(Statistic, {
    ...rest,
    value: value,
    valueRender: valueRender,
    formatter: formatter
  });
};
export default StatisticTimer;