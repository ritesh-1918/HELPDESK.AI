"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import InfoCircleFilled from "@ant-design/icons/es/icons/InfoCircleFilled";
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import { Notice } from '@rc-component/notification';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { cloneElement } from '../_util/reactNode';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useStyle from './style';
export const TypeIcon = {
  info: /*#__PURE__*/React.createElement(InfoCircleFilled, null),
  success: /*#__PURE__*/React.createElement(CheckCircleFilled, null),
  error: /*#__PURE__*/React.createElement(CloseCircleFilled, null),
  warning: /*#__PURE__*/React.createElement(ExclamationCircleFilled, null),
  loading: /*#__PURE__*/React.createElement(LoadingOutlined, null)
};
export const PureContent = props => {
  const {
    prefixCls,
    type,
    icon,
    children,
    classNames: pureContentClassNames,
    styles
  } = props;
  const iconElement = icon || type && TypeIcon[type];
  const iconNode = cloneElement(iconElement, currentProps => {
    const mergedStyle = {
      ...currentProps?.style,
      ...styles?.icon
    };
    return {
      className: clsx(currentProps.className, pureContentClassNames?.icon),
      style: mergedStyle
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-custom-content`, `${prefixCls}-${type}`)
  }, iconNode, /*#__PURE__*/React.createElement("span", {
    className: pureContentClassNames?.content,
    style: styles?.content
  }, children));
};
/** @private Internal Component. Do not use in your production. */
const PurePanel = props => {
  const {
    prefixCls: staticPrefixCls,
    className,
    style,
    type,
    icon,
    content,
    classNames: messageClassNames,
    styles,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('message');
  const prefixCls = staticPrefixCls || getPrefixCls('message');
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, messageClassNames], [contextStyles, styles], {
    props
  });
  return /*#__PURE__*/React.createElement(Notice, {
    ...restProps,
    prefixCls: prefixCls,
    className: clsx(contextClassName, mergedClassNames.root, className, hashId, `${prefixCls}-notice-pure-panel`, cssVarCls, rootCls),
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    eventKey: "pure",
    duration: null,
    content: /*#__PURE__*/React.createElement(PureContent, {
      prefixCls: prefixCls,
      type: type,
      icon: icon,
      classNames: mergedClassNames,
      styles: mergedStyles
    }, content)
  });
};
export default PurePanel;