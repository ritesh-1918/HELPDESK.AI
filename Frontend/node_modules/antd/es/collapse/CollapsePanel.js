"use client";

import * as React from 'react';
import RcCollapse from '@rc-component/collapse';
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
const CollapsePanel = /*#__PURE__*/React.forwardRef((props, ref) => {
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Collapse.Panel');
    warning.deprecated(!('disabled' in props), 'disabled', 'collapsible="disabled"');
  }
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showArrow = true
  } = props;
  const prefixCls = getPrefixCls('collapse', customizePrefixCls);
  const collapsePanelClassName = clsx({
    [`${prefixCls}-no-arrow`]: !showArrow
  }, className);
  return /*#__PURE__*/React.createElement(RcCollapse.Panel, {
    ref: ref,
    ...props,
    prefixCls: prefixCls,
    className: collapsePanelClassName
  });
});
export default CollapsePanel;