"use client";

import * as React from 'react';
import { Divider } from '@rc-component/menu';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
const MenuDivider = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    dashed,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('menu', customizePrefixCls);
  const classString = clsx({
    [`${prefixCls}-item-divider-dashed`]: !!dashed
  }, className);
  return /*#__PURE__*/React.createElement(Divider, {
    className: classString,
    ...restProps
  });
};
export default MenuDivider;