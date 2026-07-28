function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import * as React from 'react';
export default function Mask(props) {
  const {
    prefixCls,
    open,
    zIndex,
    mask,
    motion,
    mobile
  } = props;
  if (!mask) {
    return null;
  }
  return /*#__PURE__*/React.createElement(CSSMotion, _extends({}, motion, {
    motionAppear: true,
    visible: open,
    removeOnLeave: true
  }), ({
    className
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      zIndex
    },
    className: clsx(`${prefixCls}-mask`, mobile && `${prefixCls}-mobile-mask`, className)
  }));
}