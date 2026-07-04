"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
const CardGrid = ({
  prefixCls,
  className,
  hoverable = true,
  ...rest
}) => {
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefix = getPrefixCls('card', prefixCls);
  const classString = clsx(`${prefix}-grid`, className, {
    [`${prefix}-grid-hoverable`]: hoverable
  });
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: classString
  });
};
if (process.env.NODE_ENV !== 'production') {
  CardGrid.displayName = 'CardGrid';
}
export default CardGrid;