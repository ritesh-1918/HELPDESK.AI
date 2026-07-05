"use client";

import * as React from 'react';
import { ConfigContext } from '../../config-provider';
import defaultLocale from '../../locale/en_US';
import useLocale from '../../locale/useLocale';
import ConfirmDialog from '../ConfirmDialog';
const HookModal = ({
  afterClose: hookAfterClose,
  config,
  ...restProps
}, ref) => {
  const [open, setOpen] = React.useState(true);
  const [innerConfig, setInnerConfig] = React.useState(config);
  const {
    direction,
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('modal');
  const rootPrefixCls = getPrefixCls();
  const afterClose = () => {
    hookAfterClose();
    innerConfig.afterClose?.();
  };
  const close = (...args) => {
    setOpen(false);
    const triggerCancel = args.some(param => param?.triggerCancel);
    if (triggerCancel) {
      innerConfig.onCancel?.(() => {}, ...args.slice(1));
    }
  };
  React.useImperativeHandle(ref, () => ({
    destroy: close,
    update: newConfig => {
      setInnerConfig(originConfig => {
        const nextConfig = typeof newConfig === 'function' ? newConfig(originConfig) : newConfig;
        return {
          ...originConfig,
          ...nextConfig
        };
      });
    }
  }));
  const mergedOkCancel = innerConfig.okCancel ?? innerConfig.type === 'confirm';
  const [contextLocale] = useLocale('Modal', defaultLocale.Modal);
  return /*#__PURE__*/React.createElement(ConfirmDialog, {
    prefixCls: prefixCls,
    rootPrefixCls: rootPrefixCls,
    ...innerConfig,
    close: close,
    open: open,
    afterClose: afterClose,
    okText: innerConfig.okText || (mergedOkCancel ? contextLocale?.okText : contextLocale?.justOkText),
    direction: innerConfig.direction || direction,
    cancelText: innerConfig.cancelText || contextLocale?.cancelText,
    ...restProps
  });
};
export default /*#__PURE__*/React.forwardRef(HookModal);