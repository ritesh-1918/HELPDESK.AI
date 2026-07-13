import * as React from 'react';
export function Item({
  children,
  setRef
}) {
  const refFunc = React.useCallback(node => {
    setRef(node);
  }, []);
  return /*#__PURE__*/React.cloneElement(children, {
    ref: refFunc
  });
}