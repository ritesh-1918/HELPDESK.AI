"use client";

import * as React from 'react';
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import { clsx } from 'clsx';
import ActionButton from '../_util/ActionButton';
import { getRenderPropValue } from '../_util/getRenderPropValue';
import Button from '../button/Button';
import { convertLegacyProps } from '../button/buttonHelpers';
import { ConfigContext } from '../config-provider';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
import PopoverPurePanel from '../popover/PurePanel';
import useStyle from './style';
export const Overlay = props => {
  const {
    prefixCls,
    okButtonProps,
    cancelButtonProps,
    title,
    description,
    cancelText,
    okText,
    okType = 'primary',
    icon = /*#__PURE__*/React.createElement(ExclamationCircleFilled, null),
    showCancel = true,
    close,
    onConfirm,
    onCancel,
    onPopupClick,
    classNames,
    styles
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const [contextLocale] = useLocale('Popconfirm', defaultLocale.Popconfirm);
  const titleNode = getRenderPropValue(title);
  const descriptionNode = getRenderPropValue(description);
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-inner-content`,
    onClick: onPopupClick
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-message`
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: `${prefixCls}-message-icon`
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-message-text`
  }, titleNode && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-title`, classNames?.title),
    style: styles?.title
  }, titleNode)), descriptionNode && (/*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-description`, classNames?.content),
    style: styles?.content
  }, descriptionNode)))), /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-buttons`
  }, showCancel && (/*#__PURE__*/React.createElement(Button, {
    onClick: onCancel,
    size: "small",
    ...cancelButtonProps
  }, cancelText || contextLocale?.cancelText)), /*#__PURE__*/React.createElement(ActionButton, {
    buttonProps: {
      size: 'small',
      ...convertLegacyProps(okType),
      ...okButtonProps
    },
    actionFn: onConfirm,
    close: close,
    prefixCls: getPrefixCls('btn'),
    quitOnNullishReturnValue: true,
    emitEvent: true
  }, okText || contextLocale?.okText)));
};
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    placement,
    className,
    style,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('popconfirm', customizePrefixCls);
  useStyle(prefixCls);
  return /*#__PURE__*/React.createElement(PopoverPurePanel, {
    placement: placement,
    className: clsx(prefixCls, className),
    style: style,
    content: /*#__PURE__*/React.createElement(Overlay, {
      prefixCls: prefixCls,
      ...restProps
    })
  });
};
export default PurePanel;