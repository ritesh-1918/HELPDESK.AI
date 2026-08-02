import * as React from 'react';
import { toArray } from '@rc-component/util';
function getCollapsible(collapsible) {
  if (collapsible && typeof collapsible === 'object') {
    return {
      ...collapsible,
      showCollapsibleIcon: collapsible.showCollapsibleIcon === undefined ? 'auto' : collapsible.showCollapsibleIcon
    };
  }
  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible,
    showCollapsibleIcon: 'auto'
  };
}
/**
 * Convert `children` into `items`.
 */
function useItems(children) {
  const items = React.useMemo(() => toArray(children).filter(item => /*#__PURE__*/React.isValidElement(item)).map(node => {
    const {
      props
    } = node;
    const {
      collapsible,
      ...restProps
    } = props;
    return {
      ...restProps,
      collapsible: getCollapsible(collapsible)
    };
  }), [children]);
  return items;
}
export default useItems;