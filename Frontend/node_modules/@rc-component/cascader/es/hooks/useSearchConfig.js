import warning from "@rc-component/util/es/warning";
import * as React from 'react';
// Convert `showSearch` to unique config
export default function useSearchConfig(showSearch, props) {
  const {
    autoClearSearchValue,
    searchValue,
    onSearch
  } = props;
  return React.useMemo(() => {
    if (!showSearch) {
      return [false, {}];
    }
    let searchConfig = {
      matchInputWidth: true,
      limit: 50,
      autoClearSearchValue,
      searchValue,
      onSearch
    };
    if (showSearch && typeof showSearch === 'object') {
      searchConfig = {
        ...searchConfig,
        ...showSearch
      };
    }
    if (searchConfig.limit <= 0) {
      searchConfig.limit = false;
      if (process.env.NODE_ENV !== 'production') {
        warning(false, "'limit' of showSearch should be positive number or false.");
      }
    }
    return [true, searchConfig];
  }, [showSearch, autoClearSearchValue, searchValue, onSearch]);
}