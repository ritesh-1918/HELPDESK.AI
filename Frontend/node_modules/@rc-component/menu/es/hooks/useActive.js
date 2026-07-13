import * as React from 'react';
import { MenuContext } from "../context/MenuContext";
export default function useActive(eventKey, disabled, onMouseEnter, onMouseLeave) {
  const {
    // Active
    activeKey,
    onActive,
    onInactive
  } = React.useContext(MenuContext);
  const ret = {
    active: activeKey === eventKey
  };

  // Skip when disabled
  if (!disabled) {
    ret.onMouseEnter = domEvent => {
      onMouseEnter?.({
        key: eventKey,
        domEvent
      });
      onActive(eventKey);
    };
    ret.onMouseLeave = domEvent => {
      onMouseLeave?.({
        key: eventKey,
        domEvent
      });
      onInactive(eventKey);
    };
  }
  return ret;
}