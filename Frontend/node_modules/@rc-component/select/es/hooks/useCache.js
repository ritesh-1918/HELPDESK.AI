import * as React from 'react';
/**
 * Cache `value` related LabeledValue & options.
 */
export default ((labeledValues, valueOptions) => {
  const cacheRef = React.useRef({
    values: new Map(),
    options: new Map()
  });
  const filledLabeledValues = React.useMemo(() => {
    const {
      values: prevValueCache,
      options: prevOptionCache
    } = cacheRef.current;

    // Fill label by cache
    const patchedValues = labeledValues.map(item => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.get(item.value)?.label
        };
      }
      return item;
    });

    // Refresh cache
    const valueCache = new Map();
    const optionCache = new Map();
    patchedValues.forEach(item => {
      valueCache.set(item.value, item);
      optionCache.set(item.value, valueOptions.get(item.value) || prevOptionCache.get(item.value));
    });
    cacheRef.current.values = valueCache;
    cacheRef.current.options = optionCache;
    return patchedValues;
  }, [labeledValues, valueOptions]);
  const getOption = React.useCallback(val => valueOptions.get(val) || cacheRef.current.options.get(val), [valueOptions]);
  return [filledLabeledValues, getOption];
});