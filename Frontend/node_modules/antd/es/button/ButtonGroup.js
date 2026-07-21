"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useToken } from '../theme/internal';
export const GroupSizeContext = /*#__PURE__*/React.createContext(undefined);
const ButtonGroup = props => {
  const {
    getPrefixCls,
    direction
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    size,
    className,
    ...others
  } = props;
  const prefixCls = getPrefixCls('btn-group', customizePrefixCls);
  const [,, hashId] = useToken();
  const sizeCls = React.useMemo(() => {
    switch (size) {
      case 'large':
        return 'lg';
      case 'small':
        return 'sm';
      default:
        return '';
    }
  }, [size]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Button.Group');
    warning.deprecated(false, 'Button.Group', 'Space.Compact');
    process.env.NODE_ENV !== "production" ? warning(!size || ['large', 'small', 'middle'].includes(size), 'usage', 'Invalid prop `size`.') : void 0;
  }
  const classes = clsx(prefixCls, {
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, className, hashId);
  return /*#__PURE__*/React.createElement(GroupSizeContext.Provider, {
    value: size
  }, /*#__PURE__*/React.createElement("div", {
    ...others,
    className: classes
  }));
};
export default ButtonGroup;