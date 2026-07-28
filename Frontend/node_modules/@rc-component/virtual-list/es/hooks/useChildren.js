import * as React from 'react';
import { Item } from "../Item";
export default function useChildren(list, startIndex, endIndex, scrollWidth, offsetX, setNodeRef, renderFunc, {
  getKey
}) {
  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const eleIndex = startIndex + index;
    const node = renderFunc(item, eleIndex, {
      style: {
        width: scrollWidth
      },
      offsetX
    });
    const key = getKey(item);
    return /*#__PURE__*/React.createElement(Item, {
      key: key,
      setRef: ele => setNodeRef(item, ele)
    }, node);
  });
}