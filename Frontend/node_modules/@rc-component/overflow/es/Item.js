import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { clsx } from 'clsx';
import ResizeObserver from '@rc-component/resize-observer';
// Use shared variable to save bundle size
const UNDEFINED = undefined;
function InternalItem(props, ref) {
  const {
    prefixCls,
    invalidate,
    item,
    renderItem,
    responsive,
    responsiveDisabled,
    registerSize,
    itemKey,
    className,
    style,
    children,
    display,
    order,
    component: Component = 'div',
    ...restProps
  } = props;
  const mergedHidden = responsive && !display;

  // ================================ Effect ================================
  function internalRegisterSize(width) {
    registerSize(itemKey, width);
  }
  React.useEffect(() => () => {
    internalRegisterSize(null);
  }, []);

  // ================================ Render ================================
  const childNode = renderItem && item !== UNDEFINED ? renderItem(item, {
    index: order
  }) : children;
  let overflowStyle;
  if (!invalidate) {
    overflowStyle = {
      opacity: mergedHidden ? 0 : 1,
      height: mergedHidden ? 0 : UNDEFINED,
      overflowY: mergedHidden ? 'hidden' : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden ? 'none' : UNDEFINED,
      position: mergedHidden ? 'absolute' : UNDEFINED
    };
  }
  const overflowProps = {};
  if (mergedHidden) {
    overflowProps['aria-hidden'] = true;
  }
  let itemNode = /*#__PURE__*/React.createElement(Component, _extends({
    className: clsx(!invalidate && prefixCls, className),
    style: {
      ...overflowStyle,
      ...style
    }
  }, overflowProps, restProps, {
    ref: ref
  }), childNode);
  if (responsive) {
    itemNode = /*#__PURE__*/React.createElement(ResizeObserver, {
      onResize: ({
        offsetWidth
      }) => {
        internalRegisterSize(offsetWidth);
      },
      disabled: responsiveDisabled
    }, itemNode);
  }
  return itemNode;
}
const Item = /*#__PURE__*/React.forwardRef(InternalItem);
if (process.env.NODE_ENV !== 'production') {
  Item.displayName = 'Item';
}
export default Item;