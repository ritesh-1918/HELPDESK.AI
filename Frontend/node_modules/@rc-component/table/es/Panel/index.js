import * as React from 'react';
const Panel = props => {
  const {
    children,
    className,
    style
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, children);
};
export default Panel;