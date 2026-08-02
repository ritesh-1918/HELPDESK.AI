/* eslint react/prop-types: 0 */
import { clsx } from 'clsx';
import React from 'react';
const Pager = props => {
  const {
    rootPrefixCls,
    page,
    active,
    className,
    style,
    showTitle,
    onClick,
    onKeyPress,
    itemRender
  } = props;
  const prefixCls = `${rootPrefixCls}-item`;
  const cls = clsx(prefixCls, `${prefixCls}-${page}`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-disabled`]: !page
  }, className);
  const handleClick = () => {
    onClick(page);
  };
  const handleKeyPress = e => {
    onKeyPress(e, onClick, page);
  };
  const pager = itemRender(page, 'page', /*#__PURE__*/React.createElement("a", {
    rel: "nofollow"
  }, page));
  return pager ? /*#__PURE__*/React.createElement("li", {
    title: showTitle ? String(page) : null,
    className: cls,
    style: style,
    onClick: handleClick,
    onKeyDown: handleKeyPress,
    tabIndex: 0
  }, pager) : null;
};
if (process.env.NODE_ENV !== 'production') {
  Pager.displayName = 'Pager';
}
export default Pager;