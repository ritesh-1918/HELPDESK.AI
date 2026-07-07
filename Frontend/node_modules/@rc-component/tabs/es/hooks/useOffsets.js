import { useMemo } from 'react';
const DEFAULT_SIZE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0
};
export default function useOffsets(tabs, tabSizes, holderScrollWidth) {
  return useMemo(() => {
    const map = new Map();
    const lastOffset = tabSizes.get(tabs[0]?.key) || DEFAULT_SIZE;
    const rightOffset = lastOffset.left + lastOffset.width;
    for (let i = 0; i < tabs.length; i += 1) {
      const {
        key
      } = tabs[i];
      let data = tabSizes.get(key);

      // Reuse last one when not exist yet
      if (!data) {
        data = tabSizes.get(tabs[i - 1]?.key) || DEFAULT_SIZE;
      }
      const entity = map.get(key) || {
        ...data
      };

      // Right
      entity.right = rightOffset - entity.left - entity.width;

      // Update entity
      map.set(key, entity);
    }
    return map;
  }, [tabs.map(tab => tab.key).join('_'), tabSizes, holderScrollWidth]);
}