"use client";

import * as React from 'react';
import Button from '../button/Button';
const PickerButton = props => (/*#__PURE__*/React.createElement(Button, {
  size: "small",
  type: "primary",
  ...props
}));
export default PickerButton;