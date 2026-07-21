"use client";

import * as React from 'react';
import { FormProvider as RcFormProvider } from '@rc-component/form';
import { omit } from '@rc-component/util';
export const FormContext = /*#__PURE__*/React.createContext({
  labelAlign: 'right',
  layout: 'horizontal',
  itemRef: () => {}
});
export const NoStyleItemContext = /*#__PURE__*/React.createContext(null);
export const FormProvider = props => {
  const providerProps = omit(props, ['prefixCls']);
  return /*#__PURE__*/React.createElement(RcFormProvider, {
    ...providerProps
  });
};
export const FormItemPrefixContext = /*#__PURE__*/React.createContext({
  prefixCls: ''
});
export const FormItemInputContext = /*#__PURE__*/React.createContext({});
if (process.env.NODE_ENV !== 'production') {
  FormItemInputContext.displayName = 'FormItemInputContext';
}
export const NoFormStyle = ({
  children,
  status,
  override
}) => {
  const formItemInputContext = React.useContext(FormItemInputContext);
  const newFormItemInputContext = React.useMemo(() => {
    const newContext = {
      ...formItemInputContext
    };
    if (override) {
      delete newContext.isFormItemInput;
    }
    if (status) {
      delete newContext.status;
      delete newContext.hasFeedback;
      delete newContext.feedbackIcon;
    }
    return newContext;
  }, [status, override, formItemInputContext]);
  return /*#__PURE__*/React.createElement(FormItemInputContext.Provider, {
    value: newFormItemInputContext
  }, children);
};
export const VariantContext = /*#__PURE__*/React.createContext(undefined);