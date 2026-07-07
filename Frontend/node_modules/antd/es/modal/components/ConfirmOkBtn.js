"use client";

import React, { useContext } from 'react';
import ActionButton from '../../_util/ActionButton';
import { ModalContext } from '../context';
const ConfirmOkBtn = () => {
  const {
    autoFocusButton,
    close,
    isSilent,
    okButtonProps,
    rootPrefixCls,
    okTextLocale,
    okType,
    onConfirm,
    onOk,
    onClose
  } = useContext(ModalContext);
  return /*#__PURE__*/React.createElement(ActionButton, {
    isSilent: isSilent,
    type: okType || 'primary',
    actionFn: onOk,
    close: (...args) => {
      close?.(...args);
      onConfirm?.(true);
      onClose?.();
    },
    autoFocus: autoFocusButton === 'ok',
    buttonProps: okButtonProps,
    prefixCls: `${rootPrefixCls}-btn`
  }, okTextLocale);
};
export default ConfirmOkBtn;