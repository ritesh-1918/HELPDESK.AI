"use client";

import * as React from 'react';
import { List } from '@rc-component/form';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { FormItemPrefixContext } from './context';
const FormList = ({
  prefixCls: customizePrefixCls,
  children,
  ...props
}) => {
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Form.List');
    process.env.NODE_ENV !== "production" ? warning(typeof props.name === 'number' || (Array.isArray(props.name) ? !!props.name.length : !!props.name), 'usage', 'Miss `name` prop.') : void 0;
  }
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('form', customizePrefixCls);
  const contextValue = React.useMemo(() => ({
    prefixCls,
    status: 'error'
  }), [prefixCls]);
  return /*#__PURE__*/React.createElement(List, {
    ...props
  }, (fields, operation, meta) => (/*#__PURE__*/React.createElement(FormItemPrefixContext.Provider, {
    value: contextValue
  }, children(fields.map(field => ({
    ...field,
    fieldKey: field.key
  })), operation, {
    errors: meta.errors,
    warnings: meta.warnings
  }))));
};
export default FormList;