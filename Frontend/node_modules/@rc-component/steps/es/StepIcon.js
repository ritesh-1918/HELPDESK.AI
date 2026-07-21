function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import * as React from 'react';
import { clsx } from 'clsx';
import { StepsContext } from "./Context";
import pickAttrs from "@rc-component/util/es/pickAttrs";
export const StepIconSemanticContext = /*#__PURE__*/React.createContext({});
const StepIcon = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    style,
    children,
    ...restProps
  } = props;
  const {
    prefixCls,
    classNames,
    styles
  } = React.useContext(StepsContext);
  const {
    className: itemClassName,
    style: itemStyle
  } = React.useContext(StepIconSemanticContext);
  const itemCls = `${prefixCls}-item`;
  return /*#__PURE__*/React.createElement("div", _extends({}, pickAttrs(restProps, false), {
    ref: ref,
    className: clsx(`${itemCls}-icon`, classNames.itemIcon, itemClassName, className),
    style: {
      ...styles.itemIcon,
      ...itemStyle,
      ...style
    }
  }), children);
});
export default StepIcon;