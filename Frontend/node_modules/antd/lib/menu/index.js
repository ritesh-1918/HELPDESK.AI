"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _menu = require("@rc-component/menu");
var _Sider = require("../layout/Sider");
var _menu2 = _interopRequireDefault(require("./menu"));
var _MenuDivider = _interopRequireDefault(require("./MenuDivider"));
var _MenuItem = _interopRequireDefault(require("./MenuItem"));
var _SubMenu = _interopRequireDefault(require("./SubMenu"));
const Menu = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const menuRef = (0, _react.useRef)(null);
  const context = React.useContext(_Sider.SiderContext);
  (0, _react.useImperativeHandle)(ref, () => ({
    menu: menuRef.current,
    focus: options => {
      menuRef.current?.focus(options);
    }
  }));
  return /*#__PURE__*/React.createElement(_menu2.default, {
    ref: menuRef,
    ...props,
    ...context
  });
});
Menu.Item = _MenuItem.default;
Menu.SubMenu = _SubMenu.default;
Menu.Divider = _MenuDivider.default;
Menu.ItemGroup = _menu.ItemGroup;
if (process.env.NODE_ENV !== 'production') {
  Menu.displayName = 'Menu';
}
var _default = exports.default = Menu;