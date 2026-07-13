"use client";

import * as React from 'react';
import Cell from './Cell';
import DescriptionsContext from './DescriptionsContext';
function renderCells(items, {
  colon,
  prefixCls,
  bordered
}, {
  component,
  type,
  showLabel,
  showContent,
  labelStyle: rootLabelStyle,
  contentStyle: rootContentStyle,
  styles: rootStyles
}) {
  return items.map(({
    label,
    children,
    prefixCls: itemPrefixCls = prefixCls,
    className,
    style,
    labelStyle,
    contentStyle,
    span = 1,
    key,
    styles,
    classNames
  }, index) => {
    if (typeof component === 'string') {
      return /*#__PURE__*/React.createElement(Cell, {
        key: `${type}-${key || index}`,
        className: className,
        style: style,
        classNames: classNames,
        styles: {
          label: {
            ...rootLabelStyle,
            ...rootStyles?.label,
            ...labelStyle,
            ...styles?.label
          },
          content: {
            ...rootContentStyle,
            ...rootStyles?.content,
            ...contentStyle,
            ...styles?.content
          }
        },
        span: span,
        colon: colon,
        component: component,
        itemPrefixCls: itemPrefixCls,
        bordered: bordered,
        label: showLabel ? label : null,
        content: showContent ? children : null,
        type: type
      });
    }
    return [/*#__PURE__*/React.createElement(Cell, {
      key: `label-${key || index}`,
      className: className,
      style: {
        ...rootLabelStyle,
        ...rootStyles?.label,
        ...style,
        ...labelStyle,
        ...styles?.label
      },
      span: 1,
      colon: colon,
      component: component[0],
      itemPrefixCls: itemPrefixCls,
      bordered: bordered,
      label: label,
      type: "label"
    }), /*#__PURE__*/React.createElement(Cell, {
      key: `content-${key || index}`,
      className: className,
      style: {
        ...rootContentStyle,
        ...rootStyles?.content,
        ...style,
        ...contentStyle,
        ...styles?.content
      },
      span: span * 2 - 1,
      component: component[1],
      itemPrefixCls: itemPrefixCls,
      bordered: bordered,
      content: children,
      type: "content"
    })];
  });
}
const Row = props => {
  const descContext = React.useContext(DescriptionsContext);
  const {
    prefixCls,
    vertical,
    row,
    index,
    bordered
  } = props;
  if (vertical) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
      key: `label-${index}`,
      className: `${prefixCls}-row`
    }, renderCells(row, props, {
      component: 'th',
      type: 'label',
      showLabel: true,
      ...descContext
    })), /*#__PURE__*/React.createElement("tr", {
      key: `content-${index}`,
      className: `${prefixCls}-row`
    }, renderCells(row, props, {
      component: 'td',
      type: 'content',
      showContent: true,
      ...descContext
    })));
  }
  return /*#__PURE__*/React.createElement("tr", {
    key: index,
    className: `${prefixCls}-row`
  }, renderCells(row, props, {
    component: bordered ? ['th', 'td'] : 'td',
    type: 'item',
    showLabel: true,
    showContent: true,
    ...descContext
  }));
};
export default Row;