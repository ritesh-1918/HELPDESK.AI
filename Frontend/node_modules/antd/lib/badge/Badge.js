"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _clsx = require("clsx");
var _colors = require("../_util/colors");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _reactNode = require("../_util/reactNode");
var _context = require("../config-provider/context");
var _ScrollNumber = _interopRequireDefault(require("./ScrollNumber"));
var _style = _interopRequireDefault(require("./style"));
const Badge = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    scrollNumberPrefixCls: customizeScrollNumberPrefixCls,
    children,
    status,
    text,
    color,
    count = null,
    overflowCount = 99,
    dot = false,
    size = 'default',
    title,
    offset,
    style,
    className,
    rootClassName,
    classNames,
    styles,
    showZero = false,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('badge');
  const prefixCls = getPrefixCls('badge', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    overflowCount,
    size,
    dot,
    showZero
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ================================ Misc ================================
  const numberedDisplayCount = count > overflowCount ? `${overflowCount}+` : count;
  const isZero = numberedDisplayCount === '0' || numberedDisplayCount === 0 || text === '0' || text === 0;
  const ignoreCount = count === null || isZero && !showZero;
  const hasStatus = ((0, _isNonNullable.default)(status) || (0, _isNonNullable.default)(color)) && ignoreCount;
  const hasStatusValue = (0, _isNonNullable.default)(status) || !isZero;
  const showAsDot = dot && !isZero;
  const mergedCount = showAsDot ? '' : numberedDisplayCount;
  const isHidden = (0, _react.useMemo)(() => {
    const isEmpty = (!(0, _isNonNullable.default)(mergedCount) || mergedCount === '') && (!(0, _isNonNullable.default)(text) || text === '');
    return (isEmpty || isZero && !showZero) && !showAsDot;
  }, [mergedCount, isZero, showZero, showAsDot, text]);
  // Count should be cache in case hidden change it
  const countRef = (0, _react.useRef)(count);
  if (!isHidden) {
    countRef.current = count;
  }
  const livingCount = countRef.current;
  // We need cache count since remove motion should not change count display
  const displayCountRef = (0, _react.useRef)(mergedCount);
  if (!isHidden) {
    displayCountRef.current = mergedCount;
  }
  const displayCount = displayCountRef.current;
  // We will cache the dot status to avoid shaking on leaved motion
  const isDotRef = (0, _react.useRef)(showAsDot);
  if (!isHidden) {
    isDotRef.current = showAsDot;
  }
  // =============================== Styles ===============================
  const mergedStyle = (0, _react.useMemo)(() => {
    if (!offset) {
      return {
        ...contextStyle,
        ...style
      };
    }
    const horizontalOffset = Number.parseInt(offset[0], 10);
    const offsetStyle = {
      marginTop: offset[1],
      insetInlineEnd: -horizontalOffset
    };
    return {
      ...offsetStyle,
      ...contextStyle,
      ...style
    };
  }, [offset, style, contextStyle]);
  // =============================== Render ===============================
  // >>> Title
  const titleNode = title ?? (typeof livingCount === 'string' || typeof livingCount === 'number' ? livingCount : undefined);
  // >>> Status Text
  const showStatusTextNode = !isHidden && (text === 0 ? showZero : !!text && text !== true);
  const statusTextNode = !showStatusTextNode ? null : (/*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-status-text`
  }, text));
  // >>> Display Component
  const displayNode = !livingCount || typeof livingCount !== 'object' ? undefined : (0, _reactNode.cloneElement)(livingCount, oriProps => ({
    style: {
      ...mergedStyle,
      ...oriProps.style
    }
  }));
  // InternalColor
  const isInternalColor = (0, _colors.isPresetColor)(color, false);
  // Shared styles
  const statusCls = (0, _clsx.clsx)(mergedClassNames.indicator, {
    [`${prefixCls}-status-dot`]: hasStatus,
    [`${prefixCls}-status-${status}`]: !!status,
    [`${prefixCls}-color-${color}`]: isInternalColor
  });
  const statusStyle = {};
  if (color && !isInternalColor) {
    statusStyle.color = color;
    statusStyle.background = color;
  }
  const badgeClassName = (0, _clsx.clsx)(prefixCls, {
    [`${prefixCls}-status`]: hasStatus,
    [`${prefixCls}-not-a-wrapper`]: !children,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName, contextClassName, mergedClassNames.root, hashId, cssVarCls);
  // <Badge status="success" />
  if (!children && hasStatus && (text || hasStatusValue || !ignoreCount)) {
    const statusTextColor = mergedStyle.color;
    return /*#__PURE__*/React.createElement("span", {
      ref: ref,
      ...restProps,
      className: badgeClassName,
      style: {
        ...mergedStyles.root,
        ...mergedStyle
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: statusCls,
      style: {
        ...mergedStyles.indicator,
        ...statusStyle
      }
    }), showStatusTextNode && (/*#__PURE__*/React.createElement("span", {
      style: {
        color: statusTextColor
      },
      className: `${prefixCls}-status-text`
    }, text)));
  }
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    ...restProps,
    className: badgeClassName,
    style: mergedStyles.root
  }, children, /*#__PURE__*/React.createElement(_motion.default, {
    visible: !isHidden,
    motionName: `${prefixCls}-zoom`,
    motionAppear: false,
    motionDeadline: 1000
  }, ({
    className: motionClassName
  }) => {
    const scrollNumberPrefixCls = getPrefixCls('scroll-number', customizeScrollNumberPrefixCls);
    const isDot = isDotRef.current;
    const scrollNumberCls = (0, _clsx.clsx)(mergedClassNames.indicator, {
      [`${prefixCls}-dot`]: isDot,
      [`${prefixCls}-count`]: !isDot,
      [`${prefixCls}-count-sm`]: size === 'small',
      [`${prefixCls}-multiple-words`]: !isDot && displayCount && displayCount.toString().length > 1,
      [`${prefixCls}-status-${status}`]: !!status,
      [`${prefixCls}-color-${color}`]: isInternalColor
    });
    let scrollNumberStyle = {
      ...mergedStyles.indicator,
      ...mergedStyle
    };
    if (color && !isInternalColor) {
      scrollNumberStyle = scrollNumberStyle || {};
      scrollNumberStyle.background = color;
    }
    return /*#__PURE__*/React.createElement(_ScrollNumber.default, {
      prefixCls: scrollNumberPrefixCls,
      show: !isHidden,
      motionClassName: motionClassName,
      className: scrollNumberCls,
      count: displayCount,
      title: titleNode,
      style: scrollNumberStyle,
      key: "scrollNumber"
    }, displayNode);
  }), statusTextNode);
});
if (process.env.NODE_ENV !== 'production') {
  Badge.displayName = 'Badge';
}
var _default = exports.default = Badge;