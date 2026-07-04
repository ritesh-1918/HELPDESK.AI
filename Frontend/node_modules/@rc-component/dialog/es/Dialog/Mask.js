function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
const Mask = props => {
  const {
    prefixCls,
    style,
    visible,
    maskProps,
    motionName,
    className
  } = props;
  return /*#__PURE__*/React.createElement(CSSMotion, {
    key: "mask",
    visible: visible,
    motionName: motionName,
    leavedClassName: `${prefixCls}-mask-hidden`
  }, ({
    className: motionClassName,
    style: motionStyle
  }, ref) => /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    style: {
      ...motionStyle,
      ...style
    },
    className: clsx(`${prefixCls}-mask`, motionClassName, className)
  }, maskProps)));
};
export default Mask;