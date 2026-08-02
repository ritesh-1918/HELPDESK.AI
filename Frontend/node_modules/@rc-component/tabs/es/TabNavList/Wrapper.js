// zombieJ: To compatible with `renderTabBar` usage.

import * as React from 'react';
import TabNavList from '.';
// We have to create a TabNavList components.
const TabNavListWrapper = ({
  renderTabBar,
  ...restProps
}) => {
  if (renderTabBar) {
    return renderTabBar(restProps, TabNavList);
  }
  return /*#__PURE__*/React.createElement(TabNavList, restProps);
};
if (process.env.NODE_ENV !== 'production') {
  TabNavListWrapper.displayName = 'TabNavListWrapper';
}
export default TabNavListWrapper;