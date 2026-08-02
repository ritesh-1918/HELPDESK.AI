"use client";

import * as React from 'react';
import RcDrawer from '@rc-component/drawer';
import useId from "@rc-component/util/es/hooks/useId";
import { composeRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import ContextIsolator from '../_util/ContextIsolator';
import { useMergedMask, useMergeSemantic, useZIndex } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import { devUseWarning } from '../_util/warning';
import zIndexContext from '../_util/zindexContext';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import { usePanelRef } from '../watermark/context';
import DrawerPanel from './DrawerPanel';
import useStyle from './style';
import useFocusable from './useFocusable';
const _SizeTypes = ['default', 'large'];
const DEFAULT_PUSH_STATE = {
  distance: 180
};
const DEFAULT_SIZE = 378;
const MOTION_CONFIG = {
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  motionDeadline: 500
};
const Drawer = props => {
  const {
    rootClassName,
    size,
    defaultSize = DEFAULT_SIZE,
    height,
    width,
    mask: drawerMask,
    push = DEFAULT_PUSH_STATE,
    open,
    afterOpenChange,
    onClose,
    prefixCls: customizePrefixCls,
    getContainer: customizeGetContainer,
    panelRef = null,
    style,
    className,
    resizable,
    'aria-labelledby': ariaLabelledby,
    // Focus
    focusable,
    // Deprecated
    maskClosable,
    maskStyle,
    drawerStyle,
    contentWrapperStyle,
    destroyOnClose,
    destroyOnHidden,
    ...rest
  } = props;
  const {
    placement
  } = rest;
  const id = useId();
  const ariaId = rest.title ? id : undefined;
  const {
    getPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    mask: contextMask
  } = useComponentConfig('drawer');
  const prefixCls = getPrefixCls('drawer', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const getContainer =
  // 有可能为 false，所以不能直接判断
  customizeGetContainer === undefined && getPopupContainer ? () => getPopupContainer(document.body) : customizeGetContainer;
  // ============================ Size ============================
  const drawerSize = React.useMemo(() => {
    if (typeof size === 'number') {
      return size;
    }
    if (size === 'large') {
      return 736;
    }
    if (size === 'default') {
      return DEFAULT_SIZE;
    }
    if (typeof size === 'string') {
      if (/^\d+(\.\d+)?$/.test(size)) {
        return Number(size);
      }
      return size;
    }
    if (!placement || placement === 'left' || placement === 'right') {
      return width;
    }
    return height;
  }, [size, placement, width, height]);
  // =========================== Motion ===========================
  const maskMotion = {
    motionName: getTransitionName(prefixCls, 'mask-motion'),
    ...MOTION_CONFIG
  };
  const panelMotion = motionPlacement => ({
    motionName: getTransitionName(prefixCls, `panel-motion-${motionPlacement}`),
    ...MOTION_CONFIG
  });
  // ============================ Refs ============================
  // Select `ant-drawer-content` by `panelRef`
  const innerPanelRef = usePanelRef();
  const mergedPanelRef = composeRef(panelRef, innerPanelRef);
  // =========================== zIndex ===========================
  const [zIndex, contextZIndex] = useZIndex('Drawer', rest.zIndex);
  // ============================ Mask ============================
  const [mergedMask, maskBlurClassName, mergedMaskClosable] = useMergedMask(drawerMask, contextMask, prefixCls, maskClosable);
  // ========================== Focusable =========================
  const mergedFocusable = useFocusable(focusable, getContainer !== false && mergedMask);
  // =========================== Render ===========================
  const {
    classNames,
    styles,
    rootStyle
  } = rest;
  const mergedProps = {
    ...props,
    zIndex,
    panelRef,
    mask: mergedMask,
    maskClosable: mergedMaskClosable,
    defaultSize,
    push,
    focusable: mergedFocusable
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const drawerClassName = clsx({
    'no-mask': !mergedMask,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, rootClassName, hashId, cssVarCls, mergedClassNames.root);
  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Drawer');
    [['headerStyle', 'styles.header'], ['bodyStyle', 'styles.body'], ['footerStyle', 'styles.footer'], ['contentWrapperStyle', 'styles.wrapper'], ['maskStyle', 'styles.mask'], ['drawerStyle', 'styles.section'], ['destroyInactivePanel', 'destroyOnHidden'], ['width', 'size'], ['height', 'size']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    if (getContainer !== undefined && props.style?.position === 'absolute') {
      process.env.NODE_ENV !== "production" ? warning(false, 'breaking', '`style` is replaced by `rootStyle` in v5. Please check that `position: absolute` is necessary.') : void 0;
    }
    warning.deprecated(!(mergedClassNames?.content || mergedStyles?.content), 'classNames.content and styles.content', 'classNames.section and styles.section');
  }
  return /*#__PURE__*/React.createElement(ContextIsolator, {
    form: true,
    space: true
  }, /*#__PURE__*/React.createElement(zIndexContext.Provider, {
    value: contextZIndex
  }, /*#__PURE__*/React.createElement(RcDrawer, {
    prefixCls: prefixCls,
    onClose: onClose,
    maskMotion: maskMotion,
    motion: panelMotion,
    ...rest,
    classNames: {
      mask: clsx(mergedClassNames.mask, maskBlurClassName.mask),
      section: mergedClassNames.section,
      wrapper: mergedClassNames.wrapper,
      dragger: mergedClassNames.dragger
    },
    styles: {
      mask: {
        ...mergedStyles.mask,
        ...maskStyle
      },
      section: {
        ...mergedStyles.section,
        ...drawerStyle
      },
      wrapper: {
        ...mergedStyles.wrapper,
        ...contentWrapperStyle
      },
      dragger: mergedStyles.dragger
    },
    open: open,
    mask: mergedMask,
    maskClosable: mergedMaskClosable,
    push: push,
    size: drawerSize,
    defaultSize: defaultSize,
    style: {
      ...contextStyle,
      ...style
    },
    rootStyle: {
      ...rootStyle,
      ...mergedStyles.root
    },
    className: clsx(contextClassName, className),
    rootClassName: drawerClassName,
    getContainer: getContainer,
    afterOpenChange: afterOpenChange,
    panelRef: mergedPanelRef,
    zIndex: zIndex,
    ...(resizable ? {
      resizable
    } : {}),
    "aria-labelledby": ariaLabelledby ?? ariaId,
    destroyOnHidden: destroyOnHidden ?? destroyOnClose,
    // Focusable
    focusTriggerAfterClose: mergedFocusable.focusTriggerAfterClose,
    focusTrap: mergedFocusable.trap
  }, /*#__PURE__*/React.createElement(DrawerPanel, {
    prefixCls: prefixCls,
    size: size,
    ...rest,
    ariaId: ariaId,
    onClose: onClose
  }))));
};
/** @private Internal Component. Do not use in your production. */
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    style,
    className,
    placement = 'right',
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('drawer', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const cls = clsx(prefixCls, `${prefixCls}-pure`, `${prefixCls}-${placement}`, hashId, cssVarCls, className);
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: style
  }, /*#__PURE__*/React.createElement(DrawerPanel, {
    prefixCls: prefixCls,
    ...restProps
  }));
};
Drawer._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}
export default Drawer;