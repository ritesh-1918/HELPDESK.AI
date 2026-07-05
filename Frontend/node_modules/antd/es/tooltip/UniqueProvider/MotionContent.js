"use client";

import React from 'react';
import CSSMotion from '@rc-component/motion';
import { clsx } from 'clsx';
import { cloneElement } from '../../_util/reactNode';
import { ConfigContext } from '../../config-provider/context';
const MotionContent = ({
  children
}) => {
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const rootPrefixCls = getPrefixCls();
  // This will never reach since we will not render this when no children
  /* istanbul ignore next */
  if (! /*#__PURE__*/React.isValidElement(children)) {
    return children;
  }
  return /*#__PURE__*/React.createElement(CSSMotion, {
    visible: true,
    motionName: `${rootPrefixCls}-fade`,
    motionAppear: true,
    motionEnter: true,
    motionLeave: false,
    removeOnLeave: false
  }, ({
    style: motionStyle,
    className: motionClassName
  }) => {
    return cloneElement(children, oriProps => ({
      className: clsx(oriProps.className, motionClassName),
      style: {
        ...oriProps.style,
        ...motionStyle
      }
    }));
  });
};
export default MotionContent;