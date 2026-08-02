"use client";

import * as React from 'react';
import CheckCircleFilled from "@ant-design/icons/es/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/es/icons/CloseCircleFilled";
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import InfoCircleFilled from "@ant-design/icons/es/icons/InfoCircleFilled";
import { clsx } from 'clsx';
import { CONTAINER_MAX_OFFSET, normalizeMaskConfig } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import { devUseWarning } from '../_util/warning';
import ConfigProvider from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { useLocale } from '../locale';
import useToken from '../theme/useToken';
import CancelBtn from './components/ConfirmCancelBtn';
import OkBtn from './components/ConfirmOkBtn';
import { ModalContextProvider } from './context';
import Modal from './Modal';
import Confirm from './style/confirm';
export const ConfirmContent = props => {
  const {
    prefixCls,
    icon,
    okText,
    cancelText,
    confirmPrefixCls,
    type,
    okCancel,
    footer,
    // Legacy for static function usage
    locale: staticLocale,
    autoFocusButton,
    focusable,
    ...restProps
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Modal');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
  }
  // Icon
  let mergedIcon = icon;
  // 支持传入{ icon: null }来隐藏`Modal.confirm`默认的Icon
  if (!icon && icon !== null) {
    switch (type) {
      case 'info':
        mergedIcon = /*#__PURE__*/React.createElement(InfoCircleFilled, null);
        break;
      case 'success':
        mergedIcon = /*#__PURE__*/React.createElement(CheckCircleFilled, null);
        break;
      case 'error':
        mergedIcon = /*#__PURE__*/React.createElement(CloseCircleFilled, null);
        break;
      default:
        mergedIcon = /*#__PURE__*/React.createElement(ExclamationCircleFilled, null);
    }
  }
  // 默认为 true，保持向下兼容
  const mergedOkCancel = okCancel ?? type === 'confirm';
  const mergedAutoFocusButton = React.useMemo(() => {
    const base = focusable?.autoFocusButton || autoFocusButton;
    return base || base === null ? base : 'ok';
  }, [autoFocusButton, focusable?.autoFocusButton]);
  const [locale] = useLocale('Modal');
  const mergedLocale = staticLocale || locale;
  // ================== Locale Text ==================
  const okTextLocale = okText || (mergedOkCancel ? mergedLocale?.okText : mergedLocale?.justOkText);
  const cancelTextLocale = cancelText || mergedLocale?.cancelText;
  // ================= Context Value =================
  const {
    closable
  } = restProps;
  const {
    onClose
  } = closable && typeof closable === 'object' ? closable : {};
  const memoizedValue = React.useMemo(() => {
    return {
      autoFocusButton: mergedAutoFocusButton,
      cancelTextLocale,
      okTextLocale,
      mergedOkCancel,
      onClose,
      ...restProps
    };
  }, [mergedAutoFocusButton, cancelTextLocale, okTextLocale, mergedOkCancel, onClose, restProps]);
  // ====================== Footer Origin Node ======================
  const footerOriginNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CancelBtn, null), /*#__PURE__*/React.createElement(OkBtn, null));
  const hasTitle = props.title !== undefined && props.title !== null;
  const bodyCls = `${confirmPrefixCls}-body`;
  return /*#__PURE__*/React.createElement("div", {
    className: `${confirmPrefixCls}-body-wrapper`
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(bodyCls, {
      [`${bodyCls}-has-title`]: hasTitle
    })
  }, mergedIcon, /*#__PURE__*/React.createElement("div", {
    className: `${confirmPrefixCls}-paragraph`
  }, hasTitle && /*#__PURE__*/React.createElement("span", {
    className: `${confirmPrefixCls}-title`
  }, props.title), /*#__PURE__*/React.createElement("div", {
    className: `${confirmPrefixCls}-content`
  }, props.content))), footer === undefined || typeof footer === 'function' ? (/*#__PURE__*/React.createElement(ModalContextProvider, {
    value: memoizedValue
  }, /*#__PURE__*/React.createElement("div", {
    className: `${confirmPrefixCls}-btns`
  }, typeof footer === 'function' ? footer(footerOriginNode, {
    OkBtn,
    CancelBtn
  }) : footerOriginNode))) : footer, /*#__PURE__*/React.createElement(Confirm, {
    prefixCls: prefixCls
  }));
};
const ConfirmDialog = props => {
  const {
    close,
    zIndex,
    maskStyle,
    direction,
    prefixCls,
    wrapClassName,
    rootPrefixCls,
    bodyStyle,
    closable = false,
    onConfirm,
    styles,
    title,
    mask,
    maskClosable,
    okButtonProps,
    cancelButtonProps
  } = props;
  const {
    cancelButtonProps: contextCancelButtonProps,
    okButtonProps: contextOkButtonProps
  } = useComponentConfig('modal');
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Modal');
    [['bodyStyle', 'styles.body'], ['maskStyle', 'styles.mask']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const confirmPrefixCls = `${prefixCls}-confirm`;
  const width = props.width || 416;
  const style = props.style || {};
  const classString = clsx(confirmPrefixCls, `${confirmPrefixCls}-${props.type}`, {
    [`${confirmPrefixCls}-rtl`]: direction === 'rtl'
  }, props.className);
  // ========================== Mask ==========================
  // 默认为 false，保持旧版默认行为
  const mergedMask = React.useMemo(() => {
    const nextMaskConfig = normalizeMaskConfig(mask, maskClosable);
    nextMaskConfig.closable ?? (nextMaskConfig.closable = false);
    return nextMaskConfig;
  }, [mask, maskClosable]);
  // ========================= zIndex =========================
  const [, token] = useToken();
  const mergedZIndex = React.useMemo(() => {
    if (zIndex !== undefined) {
      return zIndex;
    }
    // Static always use max zIndex
    return token.zIndexPopupBase + CONTAINER_MAX_OFFSET;
  }, [zIndex, token]);
  // ========================= Render =========================
  return /*#__PURE__*/React.createElement(Modal, {
    ...props,
    className: classString,
    wrapClassName: clsx({
      [`${confirmPrefixCls}-centered`]: !!props.centered
    }, wrapClassName),
    onCancel: () => {
      close?.({
        triggerCancel: true
      });
      onConfirm?.(false);
    },
    title: title,
    footer: null,
    transitionName: getTransitionName(rootPrefixCls || '', 'zoom', props.transitionName),
    maskTransitionName: getTransitionName(rootPrefixCls || '', 'fade', props.maskTransitionName),
    mask: mergedMask,
    style: style,
    styles: {
      body: bodyStyle,
      mask: maskStyle,
      ...styles
    },
    width: width,
    zIndex: mergedZIndex,
    closable: closable
  }, /*#__PURE__*/React.createElement(ConfirmContent, {
    ...props,
    confirmPrefixCls: confirmPrefixCls,
    okButtonProps: {
      ...contextOkButtonProps,
      ...okButtonProps
    },
    cancelButtonProps: {
      ...contextCancelButtonProps,
      ...cancelButtonProps
    }
  }));
};
const ConfirmDialogWrapper = props => {
  const {
    rootPrefixCls,
    iconPrefixCls,
    direction,
    theme
  } = props;
  return /*#__PURE__*/React.createElement(ConfigProvider, {
    prefixCls: rootPrefixCls,
    iconPrefixCls: iconPrefixCls,
    direction: direction,
    theme: theme
  }, /*#__PURE__*/React.createElement(ConfirmDialog, {
    ...props
  }));
};
if (process.env.NODE_ENV !== 'production') {
  ConfirmDialog.displayName = 'ConfirmDialog';
  ConfirmDialogWrapper.displayName = 'ConfirmDialogWrapper';
}
export default ConfirmDialogWrapper;