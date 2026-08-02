"use client";

import React, { useContext } from 'react';
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { cloneElement } from '../_util/reactNode';
import { ConfigContext } from '../config-provider';
import { Col } from '../grid';
import { ListContext } from './context';
export const Meta = ({
  prefixCls: customizePrefixCls,
  className,
  avatar,
  title,
  description,
  ...others
}) => {
  const {
    getPrefixCls
  } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const classString = clsx(`${prefixCls}-item-meta`, className);
  const content = /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-item-meta-content`
  }, title && /*#__PURE__*/React.createElement("h4", {
    className: `${prefixCls}-item-meta-title`
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-item-meta-description`
  }, description));
  return /*#__PURE__*/React.createElement("div", {
    ...others,
    className: classString
  }, avatar && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-item-meta-avatar`
  }, avatar), (title || description) && content);
};
const InternalItem = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    children,
    actions,
    extra,
    styles,
    className,
    classNames: customizeClassNames,
    colStyle,
    ...others
  } = props;
  const {
    grid,
    itemLayout
  } = useContext(ListContext);
  const {
    getPrefixCls,
    list
  } = useContext(ConfigContext);
  const moduleClass = moduleName => clsx(list?.item?.classNames?.[moduleName], customizeClassNames?.[moduleName]);
  const moduleStyle = moduleName => ({
    ...list?.item?.styles?.[moduleName],
    ...styles?.[moduleName]
  });
  const isItemContainsTextNodeAndNotSingular = () => {
    const childNodes = toArray(children);
    const hasTextNode = childNodes.some(node => typeof node === 'string');
    return hasTextNode && childNodes.length > 1;
  };
  const isFlexMode = () => {
    if (itemLayout === 'vertical') {
      return !!extra;
    }
    return !isItemContainsTextNodeAndNotSingular();
  };
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const actionsContent = actions && actions.length > 0 && (/*#__PURE__*/React.createElement("ul", {
    className: clsx(`${prefixCls}-item-action`, moduleClass('actions')),
    key: "actions",
    style: moduleStyle('actions')
  }, actions.map((action, i) => (
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("li", {
    key: `${prefixCls}-item-action-${i}`
  }, action, i !== actions.length - 1 && /*#__PURE__*/React.createElement("em", {
    className: `${prefixCls}-item-action-split`
  }))))));
  const Element = grid ? 'div' : 'li';
  const itemChildren = /*#__PURE__*/React.createElement(Element, {
    ...others,
    ...(!grid ? {
      ref
    } : {}),
    className: clsx(`${prefixCls}-item`, {
      [`${prefixCls}-item-no-flex`]: !isFlexMode()
    }, className)
  }, itemLayout === 'vertical' && extra ? [/*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-item-main`,
    key: "content"
  }, children, actionsContent), /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-item-extra`, moduleClass('extra')),
    key: "extra",
    style: moduleStyle('extra')
  }, extra)] : [children, actionsContent, cloneElement(extra, {
    key: 'extra'
  })]);
  return grid ? (/*#__PURE__*/React.createElement(Col, {
    ref: ref,
    flex: 1,
    style: colStyle
  }, itemChildren)) : itemChildren;
});
const Item = InternalItem;
Item.Meta = Meta;
export default Item;