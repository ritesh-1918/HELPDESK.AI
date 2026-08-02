"use client";

import * as React from 'react';
import DeleteOutlined from "@ant-design/icons/es/icons/DeleteOutlined";
import { clsx } from 'clsx';
import Checkbox from '../checkbox';
import { useLocale } from '../locale';
import defaultLocale from '../locale/en_US';
const ListItem = props => {
  const {
    prefixCls,
    classNames,
    styles,
    renderedText,
    renderedEl,
    item,
    checked,
    disabled,
    onClick,
    onRemove,
    showRemove
  } = props;
  const mergedDisabled = disabled || item?.disabled;
  const classes = clsx(`${prefixCls}-content-item`, classNames.item, {
    [`${prefixCls}-content-item-disabled`]: mergedDisabled,
    [`${prefixCls}-content-item-checked`]: checked && !mergedDisabled
  });
  let title;
  if (typeof renderedText === 'string' || typeof renderedText === 'number') {
    title = String(renderedText);
  }
  const [contextLocale] = useLocale('Transfer', defaultLocale.Transfer);
  const liProps = {
    className: classes,
    style: styles.item,
    title
  };
  const labelNode = /*#__PURE__*/React.createElement("span", {
    className: clsx(`${prefixCls}-content-item-text`, classNames.itemContent),
    style: styles.itemContent
  }, renderedEl);
  if (showRemove) {
    return /*#__PURE__*/React.createElement("li", {
      ...liProps
    }, labelNode, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: mergedDisabled,
      className: `${prefixCls}-content-item-remove`,
      "aria-label": contextLocale?.remove,
      onClick: () => onRemove?.(item)
    }, /*#__PURE__*/React.createElement(DeleteOutlined, null)));
  }
  // Default click to select
  liProps.onClick = mergedDisabled ? undefined : event => onClick(item, event);
  return /*#__PURE__*/React.createElement("li", {
    ...liProps
  }, /*#__PURE__*/React.createElement(Checkbox, {
    className: clsx(`${prefixCls}-checkbox`, classNames.itemIcon),
    style: styles.itemIcon,
    checked: checked,
    disabled: mergedDisabled
  }), labelNode);
};
export default /*#__PURE__*/React.memo(ListItem);