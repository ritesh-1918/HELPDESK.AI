"use client";

import React, { useContext } from 'react';
import ActionButton from '../../_util/ActionButton';
import { ModalContext } from '../context';
const ConfirmCancelBtn = () => {
  const {
    autoFocusButton,
    cancelButtonProps,
    cancelTextLocale,
    isSilent,
    mergedOkCancel,
    rootPrefixCls,
    close,
    onCancel,
    onConfirm,
    onClose
  } = useContext(ModalContext);
  return mergedOkCancel ? (/*#__PURE__*/React.createElement(ActionButton, {
    isSilent: isSilent,
    actionFn: onCancel,
    close: (...args) => {
      close?.(...args);
      onConfirm?.(false);
      onClose?.();
    },
    autoFocus: autoFocusButton === 'cancel',
    buttonProps: cancelButtonProps,
    prefixCls: `${rootPrefixCls}-btn`
  }, cancelTextLocale)) : null;
};
export default ConfirmCancelBtn;