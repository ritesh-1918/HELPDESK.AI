import React from 'react';
const useMergedArrow = (providedArrow, providedContextArrow) => {
  const toConfig = arrow => typeof arrow === 'boolean' ? {
    show: arrow
  } : arrow || {};
  return React.useMemo(() => {
    const arrowConfig = toConfig(providedArrow);
    const contextArrowConfig = toConfig(providedContextArrow);
    return {
      ...contextArrowConfig,
      ...arrowConfig,
      show: arrowConfig.show ?? contextArrowConfig.show ?? true
    };
  }, [providedArrow, providedContextArrow]);
};
export default useMergedArrow;