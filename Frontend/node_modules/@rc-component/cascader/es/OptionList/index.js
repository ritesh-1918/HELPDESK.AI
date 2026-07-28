function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { useBaseProps } from '@rc-component/select';
import * as React from 'react';
import RawOptionList from "./List";
const RefOptionList = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    lockOptions,
    ...baseProps
  } = useBaseProps();

  // >>>>> Render
  return /*#__PURE__*/React.createElement(RawOptionList, _extends({}, props, baseProps, {
    lockOptions: lockOptions,
    ref: ref
  }));
});
export default RefOptionList;