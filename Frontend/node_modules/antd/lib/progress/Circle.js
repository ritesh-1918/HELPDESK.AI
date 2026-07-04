"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _progress = require("@rc-component/progress");
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _context = require("../config-provider/context");
var _tooltip = _interopRequireDefault(require("../tooltip"));
var _utils = require("./utils");
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
  } = (0, _context.useComponentConfig)('progress');
  const mergedRailColor = railColor ?? trailColor;
  const [width, height] = (0, _utils.getSize)(size, 'circle');
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
  const percentArray = (0, _utils.getPercentage)(props);
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
  const strokeColor = (0, _utils.getStrokeColor)({
    success,
    strokeColor: props.strokeColor
  });
  const wrapperClassName = (0, _clsx.clsx)(`${prefixCls}-body`, {
    [`${prefixCls}-circle-gradient`]: isGradient
  }, classNames.body);
  const circleContent = /*#__PURE__*/React.createElement(_progress.Circle, {
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
    classNames: (0, _util.omit)(classNames, OMIT_SEMANTIC_NAMES),
    styles: (0, _util.omit)(styles, OMIT_SEMANTIC_NAMES)
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
    return /*#__PURE__*/React.createElement(_tooltip.default, {
      title: children
    }, node);
  }
  return node;
};
var _default = exports.default = Circle;