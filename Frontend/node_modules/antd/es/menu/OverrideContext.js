"use client";

import * as React from 'react';
import { getNodeRef, supportNodeRef, useComposeRef } from "@rc-component/util/es/ref";
import ContextIsolator from '../_util/ContextIsolator';
const OverrideContext = /*#__PURE__*/React.createContext(null);
/** @internal Only used for Dropdown component. Do not use this in your production. */
export const OverrideProvider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    children,
    ...restProps
  } = props;
  const override = React.useContext(OverrideContext);
  const context = React.useMemo(() => ({
    ...override,
    ...restProps
  }), [override, restProps.prefixCls,
  // restProps.expandIcon, Not mark as deps since this is a ReactNode
  restProps.mode, restProps.selectable, restProps.rootClassName
  // restProps.validator, Not mark as deps since this is a function
  ]);
  const canRef = supportNodeRef(children);
  const mergedRef = useComposeRef(ref, canRef ? getNodeRef(children) : null);
  return /*#__PURE__*/React.createElement(OverrideContext.Provider, {
    value: context
  }, /*#__PURE__*/React.createElement(ContextIsolator, {
    space: true
  }, canRef ? /*#__PURE__*/React.cloneElement(children, {
    ref: mergedRef
  }) : children));
});
/** @internal Only used for Dropdown component. Do not use this in your production. */
export default OverrideContext;