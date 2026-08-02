"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _clsx = require("clsx");
var _motion = _interopRequireDefault(require("@rc-component/motion"));
var _KeyCode = _interopRequireDefault(require("@rc-component/util/lib/KeyCode"));
var _react = _interopRequireDefault(require("react"));
var _PanelContent = _interopRequireDefault(require("./PanelContent"));
const CollapsePanel = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    showArrow = true,
    headerClass,
    isActive,
    onItemClick,
    forceRender,
    className,
    classNames: customizeClassNames = {},
    styles = {},
    prefixCls,
    collapsible,
    accordion,
    panelKey,
    extra,
    header,
    expandIcon,
    openMotion,
    destroyOnHidden,
    children,
    ...resetProps
  } = props;
  const disabled = collapsible === 'disabled';
  const ifExtraExist = extra !== null && extra !== undefined && typeof extra !== 'boolean';
  const collapsibleProps = {
    onClick: () => {
      onItemClick?.(panelKey);
    },
    onKeyDown: e => {
      if (e.key === 'Enter' || e.keyCode === _KeyCode.default.ENTER || e.which === _KeyCode.default.ENTER) {
        onItemClick?.(panelKey);
      }
    },
    role: accordion ? 'tab' : 'button',
    ['aria-expanded']: isActive,
    ['aria-disabled']: disabled,
    tabIndex: disabled ? -1 : 0
  };

  // ======================== Icon ========================
  const iconNodeInner = typeof expandIcon === 'function' ? expandIcon(props) : /*#__PURE__*/_react.default.createElement("i", {
    className: "arrow"
  });
  const iconNode = iconNodeInner && /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: (0, _clsx.clsx)(`${prefixCls}-expand-icon`, customizeClassNames?.icon),
    style: styles?.icon
  }, ['header', 'icon'].includes(collapsible) ? collapsibleProps : {}), iconNodeInner);
  const collapsePanelClassNames = (0, _clsx.clsx)(`${prefixCls}-item`, {
    [`${prefixCls}-item-active`]: isActive,
    [`${prefixCls}-item-disabled`]: disabled
  }, className);
  const headerClassName = (0, _clsx.clsx)(headerClass, `${prefixCls}-header`, {
    [`${prefixCls}-collapsible-${collapsible}`]: !!collapsible
  }, customizeClassNames?.header);

  // ======================== HeaderProps ========================
  const headerProps = {
    className: headerClassName,
    style: styles?.header,
    ...(['header', 'icon'].includes(collapsible) ? {} : collapsibleProps)
  };

  // ======================== Render ========================
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, resetProps, {
    ref: ref,
    className: collapsePanelClassNames
  }), /*#__PURE__*/_react.default.createElement("div", headerProps, showArrow && iconNode, /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({
    className: (0, _clsx.clsx)(`${prefixCls}-title`, customizeClassNames?.title),
    style: styles?.title
  }, collapsible === 'header' ? collapsibleProps : {}), header), ifExtraExist && /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-extra`
  }, extra)), /*#__PURE__*/_react.default.createElement(_motion.default, (0, _extends2.default)({
    visible: isActive,
    leavedClassName: `${prefixCls}-panel-hidden`
  }, openMotion, {
    forceRender: forceRender,
    removeOnLeave: destroyOnHidden
  }), ({
    className: motionClassName,
    style: motionStyle
  }, motionRef) => {
    return /*#__PURE__*/_react.default.createElement(_PanelContent.default, {
      ref: motionRef,
      prefixCls: prefixCls,
      className: motionClassName,
      classNames: customizeClassNames,
      style: motionStyle,
      styles: styles,
      isActive: isActive,
      forceRender: forceRender,
      role: accordion ? 'tabpanel' : undefined
    }, children);
  }));
});
var _default = exports.default = CollapsePanel;