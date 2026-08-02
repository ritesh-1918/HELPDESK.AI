import * as React from 'react';
/**
 * Cut `value` by the `count.max` prop.
 */
export function inCountRange(value, countConfig) {
  if (!countConfig.max) {
    return true;
  }
  const count = countConfig.strategy(value);
  return count <= countConfig.max;
}
export default function useCount(count, showCount) {
  return React.useMemo(() => {
    let mergedConfig = {};
    if (showCount) {
      mergedConfig.show = typeof showCount === 'object' && showCount.formatter ? showCount.formatter : !!showCount;
    }
    mergedConfig = {
      ...mergedConfig,
      ...count
    };
    const {
      show,
      ...rest
    } = mergedConfig;
    return {
      ...rest,
      show: !!show,
      showFormatter: typeof show === 'function' ? show : undefined,
      strategy: rest.strategy || (value => value.length)
    };
  }, [count, showCount]);
}