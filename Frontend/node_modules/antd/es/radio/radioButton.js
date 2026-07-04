"use client";

import * as React from 'react';
import { ConfigContext } from '../config-provider';
import { RadioOptionTypeContextProvider } from './context';
import Radio from './radio';
const RadioButton = (props, ref) => {
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    ...radioProps
  } = props;
  const prefixCls = getPrefixCls('radio', customizePrefixCls);
  return /*#__PURE__*/React.createElement(RadioOptionTypeContextProvider, {
    value: "button"
  }, /*#__PURE__*/React.createElement(Radio, {
    prefixCls: prefixCls,
    ...radioProps,
    type: "radio",
    ref: ref
  }));
};
export default /*#__PURE__*/React.forwardRef(RadioButton);