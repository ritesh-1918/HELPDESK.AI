"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGetSize = useGetSize;
var React = _interopRequireWildcard(require("react"));
/**
 * Size info need loop query for the `heights` which will has the perf issue.
 * Let cache result for each render phase.
 */
function useGetSize(mergedData, getKey, heights, itemHeight) {
  const [key2Index, bottomList] = React.useMemo(() => [new Map(), []], [mergedData, heights.id, itemHeight]);
  const getSize = (startKey, endKey = startKey) => {
    // Get from cache first
    let startIndex = key2Index.get(startKey);
    let endIndex = key2Index.get(endKey);

    // Loop to fill the cache
    if (startIndex === undefined || endIndex === undefined) {
      const dataLen = mergedData.length;
      for (let i = bottomList.length; i < dataLen; i += 1) {
        const item = mergedData[i];
        const key = getKey(item);
        key2Index.set(key, i);
        const cacheHeight = heights.get(key) ?? itemHeight;
        bottomList[i] = (bottomList[i - 1] || 0) + cacheHeight;
        if (key === startKey) {
          startIndex = i;
        }
        if (key === endKey) {
          endIndex = i;
        }
        if (startIndex !== undefined && endIndex !== undefined) {
          break;
        }
      }
    }
    return {
      top: bottomList[startIndex - 1] || 0,
      bottom: bottomList[endIndex]
    };
  };
  return getSize;
}