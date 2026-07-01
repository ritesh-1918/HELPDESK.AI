import React from 'react';
const Palette = ({
  children,
  style,
  prefixCls
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-palette`,
    style: {
      position: 'relative',
      ...style
    }
  }, children);
};
export default Palette;