"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortGradient = exports.handleGradient = exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _colors = require("@ant-design/colors");
var _clsx = require("clsx");
var _warning = require("../_util/warning");
var _style = require("./style");
var _utils = require("./utils");
/**
 * @example
 *   {
 *     "0%": "#afc163",
 *     "75%": "#009900",
 *     "50%": "green", // ====> '#afc163 0%, #66FF00 25%, #00CC00 50%, #009900 75%, #ffffff 100%'
 *     "25%": "#66FF00",
 *     "100%": "#ffffff"
 *   }
 */
const sortGradient = gradients => {
  let tempArr = [];
  Object.keys(gradients).forEach(key => {
    const formattedKey = Number.parseFloat(key.replace(/%/g, ''));
    if (!Number.isNaN(formattedKey)) {
      tempArr.push({
        key: formattedKey,
        value: gradients[key]
      });
    }
  });
  tempArr = tempArr.sort((a, b) => a.key - b.key);
  return tempArr.map(({
    key,
    value
  }) => `${value} ${key}%`).join(', ');
};
/**
 * Then this man came to realize the truth: Besides six pence, there is the moon. Besides bread and
 * butter, there is the bug. And... Besides women, there is the code.
 *
 * @example
 *   {
 *     "0%": "#afc163",
 *     "25%": "#66FF00",
 *     "50%": "#00CC00", // ====>  linear-gradient(to right, #afc163 0%, #66FF00 25%,
 *     "75%": "#009900", //        #00CC00 50%, #009900 75%, #ffffff 100%)
 *     "100%": "#ffffff"
 *   }
 */
exports.sortGradient = sortGradient;
const handleGradient = (strokeColor, directionConfig) => {
  const {
    from = _colors.presetPrimaryColors.blue,
    to = _colors.presetPrimaryColors.blue,
    direction = directionConfig === 'rtl' ? 'to left' : 'to right',
    ...rest
  } = strokeColor;
  if (Object.keys(rest).length !== 0) {
    const sortedGradients = sortGradient(rest);
    const background = `linear-gradient(${direction}, ${sortedGradients})`;
    return {
      background,
      [_style.LineStrokeColorVar]: background
    };
  }
  const background = `linear-gradient(${direction}, ${from}, ${to})`;
  return {
    background,
    [_style.LineStrokeColorVar]: background
  };
};
exports.handleGradient = handleGradient;
const Line = props => {
  const {
    prefixCls,
    classNames,
    styles,
    direction: directionConfig,
    percent,
    size,
    strokeWidth,
    strokeColor,
    strokeLinecap = 'round',
    children,
    railColor,
    trailColor,
    percentPosition,
    success
  } = props;
  const {
    align: infoAlign,
    type: infoPosition
  } = percentPosition;
  const mergedRailColor = railColor ?? trailColor;
  const borderRadius = strokeLinecap === 'square' || strokeLinecap === 'butt' ? 0 : undefined;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Progress');
    warning.deprecated(!('strokeWidth' in props), 'strokeWidth', 'size');
  }
  // ========================= Size =========================
  const mergedSize = size ?? [-1, strokeWidth || (size === 'small' ? 6 : 8)];
  const [width, height] = (0, _utils.getSize)(mergedSize, 'line', {
    strokeWidth
  });
  // ========================= Rail =========================
  const railStyle = {
    backgroundColor: mergedRailColor || undefined,
    borderRadius,
    height
  };
  // ======================== Tracks ========================
  const trackCls = `${prefixCls}-track`;
  const backgroundProps = strokeColor && typeof strokeColor !== 'string' ? handleGradient(strokeColor, directionConfig) : {
    [_style.LineStrokeColorVar]: strokeColor,
    background: strokeColor
  };
  const percentTrackStyle = {
    width: `${(0, _utils.validProgress)(percent)}%`,
    height,
    borderRadius,
    ...backgroundProps
  };
  const successPercent = (0, _utils.getSuccessPercent)(props);
  const successTrackStyle = {
    width: `${(0, _utils.validProgress)(successPercent)}%`,
    height,
    borderRadius,
    backgroundColor: success?.strokeColor
  };
  // ======================== Render ========================
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-body`, classNames.body, {
      [`${prefixCls}-body-layout-bottom`]: infoAlign === 'center' && infoPosition === 'outer'
    }),
    style: {
      width: width > 0 ? width : '100%',
      ...styles.body
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-rail`, classNames.rail),
    style: {
      ...railStyle,
      ...styles.rail
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(trackCls, classNames.track),
    style: {
      ...percentTrackStyle,
      ...styles.track
    }
  }, infoPosition === 'inner' && children), successPercent !== undefined && (/*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(trackCls, `${trackCls}-success`, classNames.track),
    style: {
      ...successTrackStyle,
      ...styles.track
    }
  }))), infoPosition === 'outer' && children);
};
var _default = exports.default = Line;