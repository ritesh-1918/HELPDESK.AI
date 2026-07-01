import * as React from 'react';
import { toArray } from '@rc-component/util';
import { matchScreen } from '../../_util/responsiveObserver';
// Convert children into items
const transChildren2Items = childNodes => toArray(childNodes).map(node => ({
  ...node?.props,
  key: node.key
}));
export default function useItems(screens, items, children) {
  const mergedItems = React.useMemo(() =>
  // Take `items` first or convert `children` into items
  items || transChildren2Items(children), [items, children]);
  const responsiveItems = React.useMemo(() => mergedItems.map(({
    span,
    ...restItem
  }) => {
    if (span === 'filled') {
      return {
        ...restItem,
        filled: true
      };
    }
    return {
      ...restItem,
      span: typeof span === 'number' ? span : matchScreen(screens, span)
    };
  }), [mergedItems, screens]);
  return responsiveItems;
}