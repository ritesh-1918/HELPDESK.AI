"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ProgressTypes = void 0;
var React = _interopRequireWildcard(require("react"));
var _fastColor = require("@ant-design/fast-color");
var _CheckCircleFilled = _interopRequireDefault(require("@ant-design/icons/CheckCircleFilled"));
var _CheckOutlined = _interopRequireDefault(require("@ant-design/icons/CheckOutlined"));
var _CloseCircleFilled = _interopRequireDefault(require("@ant-design/icons/CloseCircleFilled"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _Circle = _interopRequireDefault(require("./Circle"));
var _Line = _interopRequireDefault(require("./Line"));
var _Steps = _interopRequireDefault(require("./Steps"));
var _style = _interopRequireDefault(require("./style"));
var _utils = require("./utils");
const ProgressTypes = exports.ProgressTypes = ['line', 'circle', 'dashboard'];
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
      return new _fastColor.FastColor(color).isLight();
    }
    return false;
  }, [strokeColor]);
  const percentNumber = React.useMemo(() => {
    const successPercent = (0, _utils.getSuccessPercent)(props);
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
  } = (0, _context.useComponentConfig)('progress');
  const prefixCls = getPrefixCls('progress', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const mergedProps = {
    ...props,
    percent,
    type,
    size,
    showInfo,
    percentPosition
  };
  // ======================== Styles ========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ========================= Info =========================
  const isLineType = type === 'line';
  const isPureLineType = isLineType && !steps;
  const progressInfo = React.useMemo(() => {
    if (!showInfo) {
      return null;
    }
    const successPercent = (0, _utils.getSuccessPercent)(props);
    let text;
    const textFormatter = format || (number => `${number}%`);
    const isBrightInnerColor = isLineType && strokeColorIsBright && infoPosition === 'inner';
    if (infoPosition === 'inner' || format || progressStatus !== 'exception' && progressStatus !== 'success') {
      text = textFormatter((0, _utils.validProgress)(percent), (0, _utils.validProgress)(successPercent));
    } else if (progressStatus === 'exception') {
      text = isLineType ? /*#__PURE__*/React.createElement(_CloseCircleFilled.default, null) : /*#__PURE__*/React.createElement(_CloseOutlined.default, null);
    } else if (progressStatus === 'success') {
      text = isLineType ? /*#__PURE__*/React.createElement(_CheckCircleFilled.default, null) : /*#__PURE__*/React.createElement(_CheckOutlined.default, null);
    }
    return /*#__PURE__*/React.createElement("span", {
      className: (0, _clsx.clsx)(`${prefixCls}-indicator`, {
        [`${prefixCls}-indicator-bright`]: isBrightInnerColor,
        [`${prefixCls}-indicator-${infoAlign}`]: isPureLineType,
        [`${prefixCls}-indicator-${infoPosition}`]: isPureLineType
      }, mergedClassNames.indicator),
      style: mergedStyles.indicator,
      title: typeof text === 'string' ? text : undefined
    }, text);
  }, [showInfo, percent, percentNumber, progressStatus, type, prefixCls, format, isLineType, strokeColorIsBright, infoPosition, infoAlign, isPureLineType, mergedClassNames.indicator, mergedStyles.indicator]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Progress');
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
    progress = steps ? (/*#__PURE__*/React.createElement(_Steps.default, {
      ...sharedProps,
      strokeColor: strokeColorNotGradient,
      prefixCls: prefixCls,
      steps: typeof steps === 'object' ? steps.count : steps
    }, progressInfo)) : (/*#__PURE__*/React.createElement(_Line.default, {
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
    progress = /*#__PURE__*/React.createElement(_Circle.default, {
      ...sharedProps,
      strokeColor: strokeColorNotArray,
      prefixCls: prefixCls,
      progressStatus: progressStatus
    }, progressInfo);
  }
  const classString = (0, _clsx.clsx)(prefixCls, `${prefixCls}-status-${progressStatus}`, {
    [`${prefixCls}-${type === 'dashboard' && 'circle' || type}`]: type !== 'line',
    [`${prefixCls}-inline-circle`]: type === 'circle' && (0, _utils.getSize)(size, 'circle')[0] <= 20,
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
    ...(0, _util.omit)(restProps, ['railColor', 'trailColor', 'strokeWidth', 'width', 'gapDegree', 'gapPosition', 'gapPlacement', 'strokeLinecap', 'success'])
  }, progress);
});
if (process.env.NODE_ENV !== 'production') {
  Progress.displayName = 'Progress';
}
var _default = exports.default = Progress;