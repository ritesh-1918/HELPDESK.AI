import toArray from "@rc-component/util/es/Children/toArray";
import * as React from 'react';
export function parseChildren(children, keyPath) {
  return toArray(children).map((child, index) => {
    if ( /*#__PURE__*/React.isValidElement(child)) {
      const {
        key
      } = child;
      let eventKey = child.props?.eventKey ?? key;
      const emptyKey = eventKey === null || eventKey === undefined;
      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`;
      }
      const cloneProps = {
        key: eventKey,
        eventKey
      };
      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        cloneProps.warnKey = true;
      }
      return /*#__PURE__*/React.cloneElement(child, cloneProps);
    }
    return child;
  });
}