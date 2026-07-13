import * as React from 'react';
// Affix is a simple wrapper which should not read context or logical props
export default function Affix(props) {
  const {
    children,
    ...restProps
  } = props;
  if (!children) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", restProps, children);
}