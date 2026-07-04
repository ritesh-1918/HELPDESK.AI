import * as React from 'react';
function toArray(val) {
  return val ? Array.isArray(val) ? val : [val] : [];
}
export default function useAction(action, showAction, hideAction) {
  return React.useMemo(() => {
    const mergedShowAction = toArray(showAction ?? action);
    const mergedHideAction = toArray(hideAction ?? action);
    const showActionSet = new Set(mergedShowAction);
    const hideActionSet = new Set(mergedHideAction);
    if (showActionSet.has('hover') && !showActionSet.has('click')) {
      showActionSet.add('touch');
    }
    if (hideActionSet.has('hover') && !hideActionSet.has('click')) {
      hideActionSet.add('touch');
    }
    return [showActionSet, hideActionSet];
  }, [action, showAction, hideAction]);
}