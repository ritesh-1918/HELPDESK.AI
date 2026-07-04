import * as React from 'react';

// Convert `showSearch` to unique config
export default function useSearchConfig(showSearch, props) {
  const {
    searchValue,
    inputValue,
    onSearch,
    autoClearSearchValue,
    filterTreeNode,
    treeNodeFilterProp
  } = props;
  return React.useMemo(() => {
    const isObject = typeof showSearch === 'object';
    const searchConfig = {
      searchValue: searchValue ?? inputValue,
      onSearch,
      autoClearSearchValue,
      filterTreeNode,
      treeNodeFilterProp,
      ...(isObject ? showSearch : {})
    };
    return [isObject ? true : showSearch, searchConfig];
  }, [showSearch, searchValue, inputValue, onSearch, autoClearSearchValue, filterTreeNode, treeNodeFilterProp]);
}