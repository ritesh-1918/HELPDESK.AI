"use client";

import React from 'react';
import VerticalAlignTopOutlined from "@ant-design/icons/es/icons/VerticalAlignTopOutlined";
import CSSMotion from '@rc-component/motion';
import omit from "@rc-component/util/es/omit";
import { clsx } from 'clsx';
import getScroll from '../_util/getScroll';
import { cloneElement } from '../_util/reactNode';
import scrollTo from '../_util/scrollTo';
import throttleByAnimationFrame from '../_util/throttleByAnimationFrame';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
/**
 * @deprecated Please use `FloatButton.BackTop` instead.
 */
const BackTop = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    visibilityHeight = 400,
    target,
    onClick,
    duration = 450,
    children
  } = props;
  const [visible, setVisible] = React.useState(visibilityHeight === 0);
  const ref = React.useRef(null);
  const getDefaultTarget = () => ref.current?.ownerDocument || window;
  const handleScroll = throttleByAnimationFrame(e => {
    const scrollTop = getScroll(e.target);
    setVisible(scrollTop >= visibilityHeight);
  });
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('BackTop');
    warning.deprecated(false, 'BackTop', 'FloatButton.BackTop');
  }
  React.useEffect(() => {
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
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('back-top', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const classString = clsx(hashId, cssVarCls, prefixCls, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, rootClassName);
  // fix https://fb.me/react-unknown-prop
  const divProps = omit(props, ['prefixCls', 'className', 'rootClassName', 'children', 'visibilityHeight', 'target']);
  const defaultElement = /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-content`
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-icon`
  }, /*#__PURE__*/React.createElement(VerticalAlignTopOutlined, null)));
  return /*#__PURE__*/React.createElement("div", {
    ...divProps,
    className: classString,
    onClick: scrollToTop,
    ref: ref
  }, /*#__PURE__*/React.createElement(CSSMotion, {
    visible: visible,
    motionName: `${rootPrefixCls}-fade`
  }, ({
    className: motionClassName
  }) => cloneElement(children || defaultElement, ({
    className: cloneCls
  }) => ({
    className: clsx(motionClassName, cloneCls)
  }))));
};
if (process.env.NODE_ENV !== 'production') {
  BackTop.displayName = 'Deprecated.BackTop';
}
export default BackTop;