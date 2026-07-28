"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _reactNode = require("../_util/reactNode");
var _Statistic = _interopRequireDefault(require("./Statistic"));
var _utils = require("./utils");
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
  const update = (0, _util.useEvent)(() => {
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
  const formatter = (formatValue, config) => showTime ? (0, _utils.formatCounter)(formatValue, {
    ...config,
    format
  }, down) : '-';
  const valueRender = node => (0, _reactNode.cloneElement)(node, {
    title: undefined
  });
  // ======================== Render ========================
  return /*#__PURE__*/React.createElement(_Statistic.default, {
    ...rest,
    value: value,
    valueRender: valueRender,
    formatter: formatter
  });
};
var _default = exports.default = StatisticTimer;