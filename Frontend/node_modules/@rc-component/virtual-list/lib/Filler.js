"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _resizeObserver = _interopRequireDefault(require("@rc-component/resize-observer"));
var _clsx = require("clsx");
/**
 * Fill component to provided the scroll content real height.
 */
const Filler = /*#__PURE__*/React.forwardRef(({
  height,
  offsetY,
  offsetX,
  children,
  prefixCls,
  onInnerResize,
  innerProps,
  rtl,
  extra
}, ref) => {
  let outerStyle = {};
  let innerStyle = {
    display: 'flex',
    flexDirection: 'column'
  };
  if (offsetY !== undefined) {
    // Not set `width` since this will break `sticky: right`
    outerStyle = {
      height,
      position: 'relative',
      overflow: 'hidden'
    };
    innerStyle = {
      ...innerStyle,
      transform: `translateY(${offsetY}px)`,
      [rtl ? 'marginRight' : 'marginLeft']: -offsetX,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0
    };
  }
  return /*#__PURE__*/React.createElement("div", {
    style: outerStyle
  }, /*#__PURE__*/React.createElement(_resizeObserver.default, {
    onResize: ({
      offsetHeight
    }) => {
      if (offsetHeight && onInnerResize) {
        onInnerResize();
      }
    }
  }, /*#__PURE__*/React.createElement("div", (0, _extends2.default)({
    style: innerStyle,
    className: (0, _clsx.clsx)({
      [`${prefixCls}-holder-inner`]: prefixCls
    }),
    ref: ref
  }, innerProps), children, extra)));
});
Filler.displayName = 'Filler';
var _default = exports.default = Filler;