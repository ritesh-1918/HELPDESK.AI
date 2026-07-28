function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import toArray from "@rc-component/util/es/Children/toArray";
import { warning } from "@rc-component/util/es/warning";
import SingleObserver from "./SingleObserver";
import { Collection } from "./Collection";
const INTERNAL_PREFIX_KEY = 'rc-observer-key';
import { _rs } from "./utils/observerUtil";
export { /** @private Test only for mock trigger resize event */
_rs };
export { default as useResizeObserver } from "./useResizeObserver";
function ResizeObserver(props, ref) {
  const {
    children
  } = props;
  const childNodes = typeof children === 'function' ? [children] : toArray(children);
  if (process.env.NODE_ENV !== 'production') {
    if (childNodes.length > 1) {
      warning(false, 'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.');
    } else if (childNodes.length === 0) {
      warning(false, '`children` of ResizeObserver is empty. Nothing is in observe.');
    }
  }
  return childNodes.map((child, index) => {
    const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
    return /*#__PURE__*/React.createElement(SingleObserver, _extends({}, props, {
      key: key,
      ref: index === 0 ? ref : undefined
    }), child);
  });
}
const RefResizeObserver = /*#__PURE__*/React.forwardRef(ResizeObserver);
if (process.env.NODE_ENV !== 'production') {
  RefResizeObserver.displayName = 'ResizeObserver';
}
RefResizeObserver.Collection = Collection;
export default RefResizeObserver;