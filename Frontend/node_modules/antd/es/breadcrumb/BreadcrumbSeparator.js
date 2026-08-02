"use client";

import * as React from 'react';
import { clsx } from 'clsx';
import { ConfigContext } from '../config-provider';
import BreadcrumbContext from './BreadcrumbContext';
const BreadcrumbSeparator = ({
  children
}) => {
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('breadcrumb');
  const breadcrumbContext = React.useContext(BreadcrumbContext);
  const {
    classNames: mergedClassNames,
    styles: mergedStyles
  } = breadcrumbContext;
  return /*#__PURE__*/React.createElement("li", {
    className: clsx(`${prefixCls}-separator`, mergedClassNames?.separator),
    style: mergedStyles?.separator,
    "aria-hidden": "true"
  }, children === '' ? children : children || '/');
};
BreadcrumbSeparator.__ANT_BREADCRUMB_SEPARATOR = true;
export default BreadcrumbSeparator;