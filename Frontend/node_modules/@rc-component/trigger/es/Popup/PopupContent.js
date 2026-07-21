import * as React from 'react';
const PopupContent = /*#__PURE__*/React.memo(({
  children
}) => children, (_, next) => next.cache);
if (process.env.NODE_ENV !== 'production') {
  PopupContent.displayName = 'PopupContent';
}
export default PopupContent;