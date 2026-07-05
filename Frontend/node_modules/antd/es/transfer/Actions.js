"use client";

import React from 'react';
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import Button from '../button/Button';
function getArrowIcon(type, direction) {
  const isRight = type === 'right';
  if (direction !== 'rtl') {
    return isRight ? /*#__PURE__*/React.createElement(RightOutlined, null) : /*#__PURE__*/React.createElement(LeftOutlined, null);
  }
  return isRight ? /*#__PURE__*/React.createElement(LeftOutlined, null) : /*#__PURE__*/React.createElement(RightOutlined, null);
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
  if (/*#__PURE__*/React.isValidElement(button)) {
    const element = button;
    const onClick = event => {
      element?.props?.onClick?.(event);
      moveHandler?.(event);
    };
    return /*#__PURE__*/React.cloneElement(element, {
      disabled: disabled || !active,
      onClick
    });
  }
  return /*#__PURE__*/React.createElement(Button, {
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
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, /*#__PURE__*/React.createElement(Action, {
    type: "right",
    actions: actions,
    ...restProps
  }), !oneWay && /*#__PURE__*/React.createElement(Action, {
    type: "left",
    actions: actions,
    ...restProps
  }), actions.slice(oneWay ? 1 : 2));
};
if (process.env.NODE_ENV !== 'production') {
  Actions.displayName = 'Actions';
}
export default Actions;