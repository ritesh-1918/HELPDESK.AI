"use client";

import React, { useContext } from 'react';
import Button from '../../button/Button';
import { ModalContext } from '../context';
const NormalCancelBtn = () => {
  const {
    cancelButtonProps,
    cancelTextLocale,
    onCancel
  } = useContext(ModalContext);
  return /*#__PURE__*/React.createElement(Button, {
    onClick: onCancel,
    ...cancelButtonProps
  }, cancelTextLocale);
};
export default NormalCancelBtn;