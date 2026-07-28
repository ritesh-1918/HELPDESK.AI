"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useItems;
var _react = require("react");
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
function useItems(items, routes) {
  return (0, _react.useMemo)(() => {
    if (items) {
      return items;
    }
    if (routes) {
      return routes.map(route2item);
    }
    return null;
  }, [items, routes]);
}