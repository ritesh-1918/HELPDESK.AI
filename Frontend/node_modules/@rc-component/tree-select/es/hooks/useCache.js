import * as React from 'react';
/**
 * This function will try to call requestIdleCallback if available to save performance.
 * No need `getLabel` here since already fetch on `rawLabeledValue`.
 */
export default (values => {
  const cacheRef = React.useRef({
    valueLabels: new Map()
  });
  return React.useMemo(() => {
    const {
      valueLabels
    } = cacheRef.current;
    const valueLabelsCache = new Map();
    const filledValues = values.map(item => {
      const {
        value,
        label
      } = item;
      const mergedLabel = label ?? valueLabels.get(value);

      // Save in cache
      valueLabelsCache.set(value, mergedLabel);
      return {
        ...item,
        label: mergedLabel
      };
    });
    cacheRef.current.valueLabels = valueLabelsCache;
    return [filledValues];
  }, [values]);
});