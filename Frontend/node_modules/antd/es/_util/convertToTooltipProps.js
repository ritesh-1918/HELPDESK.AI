import { isValidElement } from 'react';
import isNonNullable from './isNonNullable';
const convertToTooltipProps = (tooltip, context) => {
  if (!isNonNullable(tooltip)) {
    return null;
  }
  if (typeof tooltip === 'object' && ! /*#__PURE__*/isValidElement(tooltip)) {
    return {
      ...context,
      ...tooltip
    };
  }
  return {
    ...context,
    title: tooltip
  };
};
export default convertToTooltipProps;