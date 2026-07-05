"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseItems = parseItems;
var React = _interopRequireWildcard(require("react"));
var _Divider = _interopRequireDefault(require("../Divider"));
var _MenuItem = _interopRequireDefault(require("../MenuItem"));
var _MenuItemGroup = _interopRequireDefault(require("../MenuItemGroup"));
var _SubMenu = _interopRequireDefault(require("../SubMenu"));
var _commonUtil = require("./commonUtil");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function convertItemsToNodes(list, components, prefixCls) {
  const {
    item: MergedMenuItem,
    group: MergedMenuItemGroup,
    submenu: MergedSubMenu,
    divider: MergedDivider
  } = components;
  return (list || []).map((opt, index) => {
    if (opt && typeof opt === 'object') {
      const {
        label,
        children,
        key,
        type,
        extra,
        ...restProps
      } = opt;
      const mergedKey = key ?? `tmp-${index}`;

      // MenuItemGroup & SubMenuItem
      if (children || type === 'group') {
        if (type === 'group') {
          // Group
          return /*#__PURE__*/React.createElement(MergedMenuItemGroup, _extends({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes(children, components, prefixCls));
        }

        // Sub Menu
        return /*#__PURE__*/React.createElement(MergedSubMenu, _extends({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes(children, components, prefixCls));
      }

      // MenuItem & Divider
      if (type === 'divider') {
        return /*#__PURE__*/React.createElement(MergedDivider, _extends({
          key: mergedKey
        }, restProps));
      }
      return /*#__PURE__*/React.createElement(MergedMenuItem, _extends({
        key: mergedKey
      }, restProps, {
        extra: extra
      }), label, (!!extra || extra === 0) && /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-item-extra`
      }, extra));
    }
    return null;
  }).filter(opt => opt);
}
function parseItems(children, items, keyPath, components, prefixCls) {
  let childNodes = children;
  const mergedComponents = {
    divider: _Divider.default,
    item: _MenuItem.default,
    group: _MenuItemGroup.default,
    submenu: _SubMenu.default,
    ...components
  };
  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls);
  }
  return (0, _commonUtil.parseChildren)(childNodes, keyPath);
}