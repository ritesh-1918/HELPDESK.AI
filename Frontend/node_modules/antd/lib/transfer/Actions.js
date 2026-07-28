"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _Button = _interopRequireDefault(require("../button/Button"));
function getArrowIcon(type, direction) {
  const isRight = type === 'right';
  if (direction !== 'rtl') {
    return isRight ? /*#__PURE__*/_react.default.createElement(_RightOutlined.default, null) : /*#__PURE__*/_react.default.createElement(_LeftOutlined.default, null);
  }
  return isRight ? /*#__PURE__*/_react.default.createElement(_LeftOutlined.default, null) : /*#__PURE__*/_react.default.createElement(_RightOutlined.default, null);
}
const Action = ({
  type,
  actions,
  moveToLeft,
  moveToRight,
  leftActive,
  rightActive,
  direction,
  disabled
}) => {
  const isRight = type === 'right';
  const button = isRight ? actions[0] : actions[1];
  const moveHandler = isRight ? moveToRight : moveToLeft;
  const active = isRight ? rightActive : leftActive;
  const icon = getArrowIcon(type, direction);
  if (/*#__PURE__*/_react.default.isValidElement(button)) {
    const element = button;
    const onClick = event => {
      element?.props?.onClick?.(event);
      moveHandler?.(event);
    };
    return /*#__PURE__*/_react.default.cloneElement(element, {
      disabled: disabled || !active,
      onClick
    });
  }
  return /*#__PURE__*/_react.default.createElement(_Button.default, {
    type: "primary",
    size: "small",
    disabled: disabled || !active,
    onClick: event => moveHandler?.(event),
    icon: icon
  }, button);
};
const Actions = props => {
  const {
    className,
    style,
    oneWay,
    actions,
    ...restProps
  } = props;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: className,
    style: style
  }, /*#__PURE__*/_react.default.createElement(Action, {
    type: "right",
    actions: actions,
    ...restProps
  }), !oneWay && /*#__PURE__*/_react.default.createElement(Action, {
    type: "left",
    actions: actions,
    ...restProps
  }), actions.slice(oneWay ? 1 : 2));
};
if (process.env.NODE_ENV !== 'production') {
  Actions.displayName = 'Actions';
}
var _default = exports.default = Actions;