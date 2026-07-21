import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { clsx } from 'clsx';
import Item from "./Item";
import { OverflowContext } from "./context";
const InternalRawItem = (props, ref) => {
  const context = React.useContext(OverflowContext);

  // Render directly when context not provided
  if (!context) {
    const {
      component: Component = 'div',
      ...restProps
    } = props;
    return /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
      ref: ref
    }));
  }
  const {
    className: contextClassName,
    ...restContext
  } = context;
  const {
    className,
    ...restProps
  } = props;

  // Do not pass context to sub item to avoid multiple measure
  return /*#__PURE__*/React.createElement(OverflowContext.Provider, {
    value: null
  }, /*#__PURE__*/React.createElement(Item, _extends({
    ref: ref,
    className: clsx(contextClassName, className)
  }, restContext, restProps)));
};
const RawItem = /*#__PURE__*/React.forwardRef(InternalRawItem);
if (process.env.NODE_ENV !== 'production') {
  RawItem.displayName = 'RawItem';
}
export default RawItem;