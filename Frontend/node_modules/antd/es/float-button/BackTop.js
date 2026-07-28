"use client";

import React, { useContext, useEffect, useState } from 'react';
import VerticalAlignTopOutlined from "@ant-design/icons/es/icons/VerticalAlignTopOutlined";
import CSSMotion from '@rc-component/motion';
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import getScroll from '../_util/getScroll';
import scrollTo from '../_util/scrollTo';
import throttleByAnimationFrame from '../_util/throttleByAnimationFrame';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { GroupContext } from './context';
import FloatButton, { floatButtonPrefixCls } from './FloatButton';
const defaultIcon = /*#__PURE__*/React.createElement(VerticalAlignTopOutlined, null);
const BackTop = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    backTopIcon: contextIcon
  } = useComponentConfig('floatButton');
  const {
    prefixCls: customizePrefixCls,
    className,
    type = 'default',
    shape = 'circle',
    visibilityHeight = 400,
    icon,
    target,
    onClick,
    duration = 450,
    ...restProps
  } = props;
  const mergedIcon = icon ?? contextIcon ?? defaultIcon;
  const [visible, setVisible] = useState(visibilityHeight === 0);
  const internalRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current
  }));
  const getDefaultTarget = () => internalRef.current?.ownerDocument || window;
  const handleScroll = throttleByAnimationFrame(e => {
    const scrollTop = getScroll(e.target);
    setVisible(scrollTop >= visibilityHeight);
  });
  useEffect(() => {
    const getTarget = target || getDefaultTarget;
    const container = getTarget();
    handleScroll({
      target: container
    });
    container?.addEventListener('scroll', handleScroll);
    return () => {
      handleScroll.cancel();
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [target]);
  const scrollToTop = e => {
    scrollTo(0, {
      getContainer: target || getDefaultTarget,
      duration
    });
    onClick?.(e);
  };
  const {
    getPrefixCls
  } = useContext(ConfigContext);
  const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const groupShape = useContext(GroupContext)?.shape;
  const mergedShape = groupShape || shape;
  const contentProps = {
    prefixCls,
    icon: mergedIcon,
    type,
    shape: mergedShape,
    ...restProps
  };
  return /*#__PURE__*/React.createElement(CSSMotion, {
    visible: visible,
    motionName: `${rootPrefixCls}-fade`
  }, ({
    className: motionClassName
  }, setRef) => (/*#__PURE__*/React.createElement(FloatButton, {
    ref: composeRef(internalRef, setRef),
    ...contentProps,
    onClick: scrollToTop,
    className: clsx(className, motionClassName)
  })));
});
if (process.env.NODE_ENV !== 'production') {
  BackTop.displayName = 'FloatButton.BackTop';
}
export default BackTop;