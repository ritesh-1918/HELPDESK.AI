"use client";

import * as React from 'react';
import { Popup } from '@rc-component/tooltip';
import { clsx } from 'clsx';
import { getRenderPropValue } from '../_util/getRenderPropValue';
import { useMergeSemantic } from '../_util/hooks';
import { ConfigContext } from '../config-provider';
import useStyle from './style';
export const Overlay = props => {
  const {
    title,
    content,
    prefixCls,
    classNames,
    styles
  } = props;
  if (!title && !content) {
    return null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, title && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, classNames?.title),
    style: styles?.title
  }, title)), content && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-content`, classNames?.content),
    style: styles?.content
  }, content)));
};
export const RawPurePanel = props => {
  const {
    hashId,
    prefixCls,
    className,
    style,
    placement = 'top',
    title,
    content,
    children,
    classNames,
    styles
  } = props;
  const titleNode = getRenderPropValue(title);
  const contentNode = getRenderPropValue(content);
  const mergedProps = {
    ...props,
    placement
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([classNames], [styles], {
    props: mergedProps
  });
  const rootClassName = clsx(hashId, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className);
  return /*#__PURE__*/React.createElement("div", {
    className: rootClassName,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-arrow`
  }), /*#__PURE__*/React.createElement(Popup, {
    ...props,
    className: hashId,
    prefixCls: prefixCls,
    classNames: mergedClassNames,
    styles: mergedStyles
  }, children || (/*#__PURE__*/React.createElement(Overlay, {
    prefixCls: prefixCls,
    title: titleNode,
    content: contentNode,
    classNames: mergedClassNames,
    styles: mergedStyles
  }))));
};
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('popover', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  return /*#__PURE__*/React.createElement(RawPurePanel, {
    ...restProps,
    prefixCls: prefixCls,
    hashId: hashId,
    className: clsx(className, cssVarCls)
  });
};
export default PurePanel;