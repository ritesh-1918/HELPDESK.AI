import { warning } from "@rc-component/util/es/warning";
import { useMemo } from 'react';
export default function useRange(range) {
  return useMemo(() => {
    if (range === true || !range) {
      return [!!range, false, false, 0];
    }
    const {
      editable,
      draggableTrack,
      minCount,
      maxCount
    } = range;
    if (process.env.NODE_ENV !== 'production') {
      warning(!editable || !draggableTrack, '`editable` can not work with `draggableTrack`.');
    }
    return [true, editable, !editable && draggableTrack, minCount || 0, maxCount];
  }, [range]);
}