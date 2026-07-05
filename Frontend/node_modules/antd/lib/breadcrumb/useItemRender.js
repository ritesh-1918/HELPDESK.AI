"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useItemRender;
exports.renderItem = renderItem;
var React = _interopRequireWildcard(require("react"));
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
function getBreadcrumbName(route, params) {
  if (!(0, _isNonNullable.default)(route.title)) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  return typeof route.title === 'object' ? route.title : String(route.title).replace(new RegExp(`:(${paramsKeys})`, 'g'), (replacement, key) => params[key] || replacement);
}
function renderItem(prefixCls, item, children, href) {
  if (!(0, _isNonNullable.default)(children)) {
    return null;
  }
  const {
    className,
    onClick,
    ...restItem
  } = item;
  const passedProps = {
    ...(0, _pickAttrs.default)(restItem, {
      data: true,
      aria: true
    }),
    onClick
  };
  if (href !== undefined) {
    return /*#__PURE__*/React.createElement("a", {
      ...passedProps,
      className: (0, _clsx.clsx)(`${prefixCls}-link`, className),
      href: href
    }, children);
  }
  return /*#__PURE__*/React.createElement("span", {
    ...passedProps,
    className: (0, _clsx.clsx)(`${prefixCls}-link`, className)
  }, children);
}
function useItemRender(prefixCls, itemRender) {
  const mergedItemRender = (item, params, routes, path, href) => {
    if (itemRender) {
      return itemRender(item, params, routes, path);
    }
    const name = getBreadcrumbName(item, params);
    return renderItem(prefixCls, item, name, href);
  };
  return mergedItemRender;
}