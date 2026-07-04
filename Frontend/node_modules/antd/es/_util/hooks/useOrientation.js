import { useMemo } from 'react';
const isValidOrientation = orientation => {
  return orientation === 'horizontal' || orientation === 'vertical';
};
export const useOrientation = (orientation, vertical, legacyDirection) => {
  return useMemo(() => {
    const validOrientation = isValidOrientation(orientation);
    let mergedOrientation;
    if (validOrientation) {
      mergedOrientation = orientation;
    } else if (typeof vertical === 'boolean') {
      mergedOrientation = vertical ? 'vertical' : 'horizontal';
    } else {
      const validLegacyDirection = isValidOrientation(legacyDirection);
      mergedOrientation = validLegacyDirection ? legacyDirection : 'horizontal';
    }
    return [mergedOrientation, mergedOrientation === 'vertical'];
  }, [legacyDirection, orientation, vertical]);
};