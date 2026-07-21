"use client";

import React from 'react';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import DescriptionsContext from './DescriptionsContext';
const Cell = props => {
  const {
    itemPrefixCls,
    component,
    span,
    className,
    style,
    labelStyle,
    contentStyle,
    bordered,
    label,
    content,
    colon,
    type,
    styles,
    classNames
  } = props;
  const Component = component;
  const {
    classNames: contextClassNames,
    styles: contextStyles
  } = React.useContext(DescriptionsContext);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  const mergedLabelStyle = {
    ...labelStyle,
    ...mergedStyles.label
  };
  const mergedContentStyle = {
    ...contentStyle,
    ...mergedStyles.content
  };
  if (bordered) {
    return /*#__PURE__*/React.createElement(Component, {
      colSpan: span,
      style: style,
      className: clsx(className, {
        [`${itemPrefixCls}-item-${type}`]: type === 'label' || type === 'content',
        [mergedClassNames.label]: mergedClassNames.label && type === 'label',
        [mergedClassNames.content]: mergedClassNames.content && type === 'content'
      })
    }, isNonNullable(label) && /*#__PURE__*/React.createElement("span", {
      style: mergedLabelStyle
    }, label), isNonNullable(content) && /*#__PURE__*/React.createElement("span", {
      style: mergedContentStyle
    }, content));
  }
  return /*#__PURE__*/React.createElement(Component, {
    className: clsx(`${itemPrefixCls}-item`, className),
    style: style,
    colSpan: span
  }, /*#__PURE__*/React.createElement("div", {
    className: `${itemPrefixCls}-item-container`
  }, isNonNullable(label) && (/*#__PURE__*/React.createElement("span", {
    style: mergedLabelStyle,
    className: clsx(`${itemPrefixCls}-item-label`, mergedClassNames.label, {
      [`${itemPrefixCls}-item-no-colon`]: !colon
    })
  }, label)), isNonNullable(content) && (/*#__PURE__*/React.createElement("span", {
    style: mergedContentStyle,
    className: clsx(`${itemPrefixCls}-item-content`, mergedClassNames.content)
  }, content))));
};
export default Cell;