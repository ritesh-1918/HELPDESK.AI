import * as React from 'react';
const FooterRow = props => {
  const {
    children,
    ...restProps
  } = props;
  return /*#__PURE__*/React.createElement("tr", restProps, children);
};
export default FooterRow;