"use client";

import React, { useContext } from 'react';
import { render, unmount } from "@rc-component/util/es/React/render";
import warning from '../_util/warning';
import ConfigProvider, { ConfigContext, globalConfig, warnContext } from '../config-provider';
import ConfirmDialog from './ConfirmDialog';
import destroyFns from './destroyFns';
import { getConfirmLocale } from './locale';
let defaultRootPrefixCls = '';
function getRootPrefixCls() {
  return defaultRootPrefixCls;
}
const ConfirmDialogWrapper = props => {
  const {
    prefixCls: customizePrefixCls,
    getContainer,
    direction
  } = props;
  const runtimeLocale = getConfirmLocale();
  const config = useContext(ConfigContext);
  const rootPrefixCls = getRootPrefixCls() || config.getPrefixCls();
  // because Modal.config set rootPrefixCls, which is different from other components
  const prefixCls = customizePrefixCls || `${rootPrefixCls}-modal`;
  let mergedGetContainer = getContainer;
  if (mergedGetContainer === false) {
    mergedGetContainer = undefined;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== "production" ? warning(false, 'Modal', 'Static method not support `getContainer` to be `false` since it do not have context env.') : void 0;
    }
  }
  return /*#__PURE__*/React.createElement(ConfirmDialog, {
    ...props,
    rootPrefixCls: rootPrefixCls,
    prefixCls: prefixCls,
    iconPrefixCls: config.iconPrefixCls,
    theme: config.theme,
    direction: direction ?? config.direction,
    locale: config.locale?.Modal ?? runtimeLocale,
    getContainer: mergedGetContainer
  });
};
export default function confirm(config) {
  const global = globalConfig();
  if (process.env.NODE_ENV !== 'production' && !global.holderRender) {
    warnContext('Modal');
  }
  const container = document.createDocumentFragment();
  let currentConfig = {
    ...config,
    close,
    open: true
  };
  let timeoutId;
  function destroy(...args) {
    const triggerCancel = args.some(param => param?.triggerCancel);
    if (triggerCancel) {
      config.onCancel?.(() => {}, ...args.slice(1));
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
    unmount(container).then(() => {
      // Do nothing
    });
  }
  const scheduleRender = props => {
    clearTimeout(timeoutId);
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    timeoutId = setTimeout(() => {
      const rootPrefixCls = global.getPrefixCls(undefined, getRootPrefixCls());
      const iconPrefixCls = global.getIconPrefixCls();
      const theme = global.getTheme();
      const dom = /*#__PURE__*/React.createElement(ConfirmDialogWrapper, {
        ...props
      });
      render(/*#__PURE__*/React.createElement(ConfigProvider, {
        prefixCls: rootPrefixCls,
        iconPrefixCls: iconPrefixCls,
        theme: theme
      }, typeof global.holderRender === 'function' ? global.holderRender(dom) : dom), container);
    });
  };
  function close(...args) {
    currentConfig = {
      ...currentConfig,
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose();
        }
        // @ts-ignore
        destroy.apply(this, args);
      }
    };
    scheduleRender(currentConfig);
  }
  function update(configUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate
      };
    }
    scheduleRender(currentConfig);
  }
  scheduleRender(currentConfig);
  destroyFns.push(close);
  return {
    destroy: close,
    update
  };
}
export function withWarn(props) {
  return {
    ...props,
    type: 'warning'
  };
}
export function withInfo(props) {
  return {
    ...props,
    type: 'info'
  };
}
export function withSuccess(props) {
  return {
    ...props,
    type: 'success'
  };
}
export function withError(props) {
  return {
    ...props,
    type: 'error'
  };
}
export function withConfirm(props) {
  return {
    ...props,
    type: 'confirm'
  };
}
export function modalGlobalConfig({
  rootPrefixCls
}) {
  process.env.NODE_ENV !== "production" ? warning(false, 'Modal', 'Modal.config is deprecated. Please use ConfigProvider.config instead.') : void 0;
  defaultRootPrefixCls = rootPrefixCls;
}