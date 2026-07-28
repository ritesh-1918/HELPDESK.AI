import { useMemo } from 'react';
function route2item(route) {
  const {
    breadcrumbName,
    children,
    ...rest
  } = route;
  const clone = {
    title: breadcrumbName,
    ...rest
  };
  if (children) {
    clone.menu = {
      items: children.map(({
        breadcrumbName: itemBreadcrumbName,
        ...itemProps
      }) => ({
        ...itemProps,
        title: itemBreadcrumbName
      }))
    };
  }
  return clone;
}
export default function useItems(items, routes) {
  return useMemo(() => {
    if (items) {
      return items;
    }
    if (routes) {
      return routes.map(route2item);
    }
    return null;
  }, [items, routes]);
}