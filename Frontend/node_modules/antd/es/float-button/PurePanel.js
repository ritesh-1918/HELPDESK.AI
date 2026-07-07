"use client";

/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import BackTop from './BackTop';
import FloatButton, { floatButtonPrefixCls } from './FloatButton';
import FloatButtonGroup from './FloatButtonGroup';
const PureFloatButton = ({
  backTop,
  ...props
}) => backTop ? /*#__PURE__*/React.createElement(BackTop, {
  ...props,
  visibilityHeight: 0
}) : /*#__PURE__*/React.createElement(FloatButton, {
  ...props
});
/** @private Internal Component. Do not use in your production. */
const PurePanel = ({
  className,
  items,
  classNames: cls,
  styles,
  prefixCls: customizePrefixCls,
  ...restProps
}) => {
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
  const pureCls = `${prefixCls}-pure`;
  if (items) {
    return /*#__PURE__*/React.createElement(FloatButtonGroup, {
      className: clsx(className, pureCls),
      classNames: cls,
      styles: styles,
      ...restProps
    }, items.map((item, index) => (/*#__PURE__*/React.createElement(PureFloatButton, {
      key: index,
      ...item
    }))));
  }
  return /*#__PURE__*/React.createElement(PureFloatButton, {
    className: clsx(className, pureCls),
    classNames: cls,
    styles: styles,
    ...restProps
  });
};
export default PurePanel;