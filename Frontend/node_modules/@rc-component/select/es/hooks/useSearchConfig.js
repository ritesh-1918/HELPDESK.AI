import * as React from 'react';

// Convert `showSearch` to unique config
export default function useSearchConfig(showSearch, props, mode) {
  const {
    filterOption,
    searchValue,
    optionFilterProp,
    filterSort,
    onSearch,
    autoClearSearchValue
  } = props;
  return React.useMemo(() => {
    const isObject = typeof showSearch === 'object';
    const searchConfig = {
      filterOption,
      searchValue,
      optionFilterProp,
      filterSort,
      onSearch,
      autoClearSearchValue,
      ...(isObject ? showSearch : {})
    };
    return [isObject || mode === 'combobox' || mode === 'tags' || mode === 'multiple' && showSearch === undefined ? true : showSearch, searchConfig];
  }, [mode, showSearch, filterOption, searchValue, optionFilterProp, filterSort, onSearch, autoClearSearchValue]);
}