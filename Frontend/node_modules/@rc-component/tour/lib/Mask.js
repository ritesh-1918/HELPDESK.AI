"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _portal = _interopRequireDefault(require("@rc-component/portal"));
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const COVER_PROPS = {
  fill: 'transparent',
  pointerEvents: 'auto'
};
const Mask = props => {
  const {
    prefixCls,
    rootClassName,
    pos,
    showMask,
    style = {},
    fill = 'rgba(0,0,0,0.5)',
    open,
    animated,
    zIndex,
    disabledInteraction,
    styles,
    classNames: tourClassNames,
    getPopupContainer,
    onEsc
  } = props;
  const id = (0, _useId.default)();
  const maskId = `${prefixCls}-mask-${id}`;
  const mergedAnimated = typeof animated === 'object' ? animated?.placeholder : animated;
  const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const maskRectSize = isSafari ? {
    width: '100%',
    height: '100%'
  } : {
    width: '100vw',
    height: '100vh'
  };
  const inlineMode = getPopupContainer === false;
  return /*#__PURE__*/_react.default.createElement(_portal.default, {
    open: open,
    autoLock: !inlineMode,
    getContainer: getPopupContainer,
    onEsc: onEsc
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-mask`, rootClassName, tourClassNames?.mask),
    style: {
      position: inlineMode ? 'absolute' : 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex,
      pointerEvents: pos && !disabledInteraction ? 'none' : 'auto',
      ...style,
      ...styles?.mask
    }
  }, showMask ? /*#__PURE__*/_react.default.createElement("svg", {
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement("defs", null, /*#__PURE__*/_react.default.createElement("mask", {
    id: maskId
  }, /*#__PURE__*/_react.default.createElement("rect", _extends({
    x: "0",
    y: "0"
  }, maskRectSize, {
    fill: "white"
  })), pos && /*#__PURE__*/_react.default.createElement("rect", {
    x: pos.left,
    y: pos.top,
    rx: pos.radius,
    width: pos.width,
    height: pos.height,
    fill: "black",
    className: mergedAnimated ? `${prefixCls}-placeholder-animated` : ''
  }))), /*#__PURE__*/_react.default.createElement("rect", {
    x: "0",
    y: "0",
    width: "100%",
    height: "100%",
    fill: fill,
    mask: `url(#${maskId})`
  }), pos && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("rect", _extends({}, COVER_PROPS, {
    x: "0",
    y: "0",
    width: "100%",
    height: Math.max(pos.top, 0)
  })), /*#__PURE__*/_react.default.createElement("rect", _extends({}, COVER_PROPS, {
    x: "0",
    y: "0",
    width: Math.max(pos.left, 0),
    height: "100%"
  })), /*#__PURE__*/_react.default.createElement("rect", _extends({}, COVER_PROPS, {
    x: "0",
    y: pos.top + pos.height,
    width: "100%",
    height: `calc(100% - ${pos.top + pos.height}px)`
  })), /*#__PURE__*/_react.default.createElement("rect", _extends({}, COVER_PROPS, {
    x: pos.left + pos.width,
    y: "0",
    width: `calc(100% - ${pos.left + pos.width}px)`,
    height: "100%"
  })))) : null));
};
var _default = exports.default = Mask;