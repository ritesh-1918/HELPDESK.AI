import * as React from 'react';
export default /*#__PURE__*/React.memo(({
  children
}) => children, (_, {
  shouldUpdate
}) => !shouldUpdate);