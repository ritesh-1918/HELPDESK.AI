import { isValidElement, useMemo } from 'react';
const useTooltipProps = (tooltip, editConfigText, children) => useMemo(() => {
  if (tooltip === true) {
    return {
      title: editConfigText ?? children
    };
  }
  if (/*#__PURE__*/isValidElement(tooltip)) {
    return {
      title: tooltip
    };
  }
  if (typeof tooltip === 'object') {
    return {
      title: editConfigText ?? children,
      ...tooltip
    };
  }
  return {
    title: tooltip
  };
}, [tooltip, editConfigText, children]);
export default useTooltipProps;