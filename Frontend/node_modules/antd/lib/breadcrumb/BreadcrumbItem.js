"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InternalBreadcrumbItem = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _configProvider = require("../config-provider");
var _dropdown = _interopRequireDefault(require("../dropdown/dropdown"));
var _BreadcrumbContext = _interopRequireDefault(require("./BreadcrumbContext"));
var _BreadcrumbSeparator = _interopRequireDefault(require("./BreadcrumbSeparator"));
var _useItemRender = require("./useItemRender");
const InternalBreadcrumbItem = props => {
  const {
    prefixCls,
    separator = '/',
    children,
    menu,
    dropdownProps,
    href,
    dropdownIcon
  } = props;
  const breadcrumbContext = React.useContext(_BreadcrumbContext.default);
  const {
    classNames: mergedClassNames,
    styles: mergedStyles
  } = breadcrumbContext;
  /** If overlay is have Wrap a Dropdown */
  const renderBreadcrumbNode = breadcrumbItem => {
    if (menu) {
      const mergeDropDownProps = {
        ...dropdownProps
      };
      if (menu) {
        const {
          items,
          ...menuProps
        } = menu || {};
        mergeDropDownProps.menu = {
          ...menuProps,
          items: items?.map(({
            key,
            title,
            label,
            path,
            ...itemProps
          }, index) => {
            let mergedLabel = label ?? title;
            if (path) {
              mergedLabel = /*#__PURE__*/React.createElement("a", {
                href: `${href}${path}`
              }, mergedLabel);
            }
            return {
              ...itemProps,
              key: key ?? index,
              label: mergedLabel
            };
          })
        };
      }
      return /*#__PURE__*/React.createElement(_dropdown.default, {
        placement: "bottom",
        ...mergeDropDownProps
      }, /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-overlay-link`
      }, breadcrumbItem, dropdownIcon));
    }
    return breadcrumbItem;
  };
  // wrap to dropDown
  const link = renderBreadcrumbNode(children);
  if ((0, _isNonNullable.default)(link)) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", {
      className: (0, _clsx.clsx)(`${prefixCls}-item`, mergedClassNames?.item),
      style: mergedStyles?.item
    }, link), separator && /*#__PURE__*/React.createElement(_BreadcrumbSeparator.default, null, separator));
  }
  return null;
};
exports.InternalBreadcrumbItem = InternalBreadcrumbItem;
const BreadcrumbItem = props => {
  const {
    prefixCls: customizePrefixCls,
    children,
    href,
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
  return /*#__PURE__*/React.createElement(InternalBreadcrumbItem, {
    ...restProps,
    prefixCls: prefixCls
  }, (0, _useItemRender.renderItem)(prefixCls, restProps, children, href));
};
BreadcrumbItem.__ANT_BREADCRUMB_ITEM = true;
var _default = exports.default = BreadcrumbItem;