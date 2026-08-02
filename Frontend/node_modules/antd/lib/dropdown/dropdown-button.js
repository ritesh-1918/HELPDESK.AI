"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _EllipsisOutlined = _interopRequireDefault(require("@ant-design/icons/EllipsisOutlined"));
var _clsx = require("clsx");
var _warning = require("../_util/warning");
var _button = _interopRequireDefault(require("../button"));
var _configProvider = require("../config-provider");
var _space = _interopRequireDefault(require("../space"));
var _Compact = require("../space/Compact");
var _dropdown = _interopRequireDefault(require("./dropdown"));
/** @deprecated Please use Space.Compact + Dropdown + Button instead */
const DropdownButton = props => {
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    type = 'default',
    danger,
    disabled,
    loading,
    onClick,
    htmlType,
    children,
    className,
    menu,
    arrow,
    autoFocus,
    trigger,
    align,
    open,
    onOpenChange,
    placement,
    getPopupContainer,
    href,
    icon = /*#__PURE__*/React.createElement(_EllipsisOutlined.default, null),
    title,
    buttonsRender = buttons => buttons,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    destroyPopupOnHide,
    dropdownRender,
    popupRender,
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('dropdown', customizePrefixCls);
  const buttonPrefixCls = `${prefixCls}-button`;
  const mergedPopupRender = popupRender || dropdownRender;
  const dropdownProps = {
    menu,
    arrow,
    autoFocus,
    align,
    disabled,
    trigger: disabled ? [] : trigger,
    onOpenChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    mouseEnterDelay,
    mouseLeaveDelay,
    classNames: {
      root: overlayClassName
    },
    styles: {
      root: overlayStyle
    },
    destroyOnHidden,
    popupRender: mergedPopupRender
  };
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  const classes = (0, _clsx.clsx)(buttonPrefixCls, compactItemClassnames, className);
  if ('destroyPopupOnHide' in props) {
    dropdownProps.destroyPopupOnHide = destroyPopupOnHide;
  }
  if ('open' in props) {
    dropdownProps.open = open;
  }
  if ('placement' in props) {
    dropdownProps.placement = placement;
  } else {
    dropdownProps.placement = direction === 'rtl' ? 'bottomLeft' : 'bottomRight';
  }
  // ============================== Warn ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Dropdown.Button');
    warning.deprecated(false, 'Dropdown.Button', 'Space.Compact + Dropdown + Button');
  }
  const leftButton = /*#__PURE__*/React.createElement(_button.default, {
    type: type,
    danger: danger,
    disabled: disabled,
    loading: loading,
    onClick: onClick,
    htmlType: htmlType,
    href: href,
    title: title
  }, children);
  const rightButton = /*#__PURE__*/React.createElement(_button.default, {
    type: type,
    danger: danger,
    icon: icon
  });
  const [leftButtonToRender, rightButtonToRender] = buttonsRender([leftButton, rightButton]);
  return /*#__PURE__*/React.createElement(_space.default.Compact, {
    className: classes,
    size: compactSize,
    block: true,
    ...restProps
  }, leftButtonToRender, /*#__PURE__*/React.createElement(_dropdown.default, {
    ...dropdownProps
  }, rightButtonToRender));
};
DropdownButton.__ANT_BUTTON = true;
var _default = exports.default = DropdownButton;