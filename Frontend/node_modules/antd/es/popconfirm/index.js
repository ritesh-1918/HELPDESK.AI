"use client";

import * as React from 'react';
import ExclamationCircleFilled from "@ant-design/icons/es/icons/ExclamationCircleFilled";
import { omit, useControlledState } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Popover from '../popover';
import useMergedArrow from '../tooltip/hook/useMergedArrow';
import PurePanel, { Overlay } from './PurePanel';
import useStyle from './style';
const InternalPopconfirm = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    placement = 'top',
    trigger,
    okType = 'primary',
    icon = /*#__PURE__*/React.createElement(ExclamationCircleFilled, null),
    children,
    overlayClassName,
    onOpenChange,
    overlayStyle,
    styles,
    arrow: popconfirmArrow,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    arrow: contextArrow,
    trigger: contextTrigger
  } = useComponentConfig('popconfirm');
  const [open, setOpen] = useControlledState(props.defaultOpen ?? false, props.open);
  const mergedArrow = useMergedArrow(popconfirmArrow, contextArrow);
  const mergedTrigger = trigger || contextTrigger || 'click';
  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Popconfirm');
    process.env.NODE_ENV !== "production" ? warning(!onOpenChange || onOpenChange.length <= 1, 'usage', 'The second `onOpenChange` parameter is internal and unsupported. Please lock to a previous version if needed.') : void 0;
  }
  const settingOpen = value => {
    setOpen(value);
    onOpenChange?.(value);
  };
  const close = () => {
    settingOpen(false);
  };
  const onConfirm = e => props.onConfirm?.call(this, e);
  const onCancel = e => {
    settingOpen(false);
    props.onCancel?.call(this, e);
  };
  const onInternalOpenChange = value => {
    const {
      disabled = false
    } = props;
    if (disabled) {
      return;
    }
    settingOpen(value);
  };
  const prefixCls = getPrefixCls('popconfirm', customizePrefixCls);
  const mergedProps = {
    ...props,
    placement,
    trigger: mergedTrigger,
    okType,
    overlayStyle,
    styles,
    classNames
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rootClassNames = clsx(prefixCls, contextClassName, overlayClassName, mergedClassNames.root);
  useStyle(prefixCls);
  return /*#__PURE__*/React.createElement(Popover, {
    arrow: mergedArrow,
    ...omit(restProps, ['title']),
    trigger: mergedTrigger,
    placement: placement,
    onOpenChange: onInternalOpenChange,
    open: open,
    ref: ref,
    classNames: {
      root: rootClassNames,
      container: mergedClassNames.container,
      arrow: mergedClassNames.arrow
    },
    styles: {
      root: {
        ...contextStyle,
        ...mergedStyles.root,
        ...overlayStyle
      },
      container: mergedStyles.container,
      arrow: mergedStyles.arrow
    },
    content: /*#__PURE__*/React.createElement(Overlay, {
      okType: okType,
      icon: icon,
      ...props,
      prefixCls: prefixCls,
      close: close,
      onConfirm: onConfirm,
      onCancel: onCancel,
      classNames: mergedClassNames,
      styles: mergedStyles
    }),
    "data-popover-inject": true
  }, children);
});
const Popconfirm = InternalPopconfirm;
// We don't care debug panel
/* istanbul ignore next */
Popconfirm._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  Popconfirm.displayName = 'Popconfirm';
}
export default Popconfirm;