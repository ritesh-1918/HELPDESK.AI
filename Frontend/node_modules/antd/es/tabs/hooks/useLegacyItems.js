import * as React from 'react';
import { toArray } from '@rc-component/util';
import { devUseWarning } from '../../_util/warning';
function filter(items) {
  return items.filter(item => item);
}
function useLegacyItems(items, children) {
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Tabs');
    warning.deprecated(!children, 'Tabs.TabPane', 'items');
  }
  if (items) {
    return items.map(item => ({
      ...item,
      destroyOnHidden: item.destroyOnHidden ?? item.destroyInactiveTabPane
    }));
  }
  const childrenItems = toArray(children).map(node => {
    if (/*#__PURE__*/React.isValidElement(node)) {
      const {
        key,
        props
      } = node;
      const {
        tab,
        ...restProps
      } = props || {};
      const item = {
        key: String(key),
        ...restProps,
        label: tab
      };
      return item;
    }
    return null;
  });
  return filter(childrenItems);
}
export default useLegacyItems;