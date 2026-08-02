"use client";

import * as React from 'react';
import { useControlledState } from '@rc-component/util';
import { clsx } from 'clsx';
import { getRenderPropValue } from '../_util/getRenderPropValue';
import { useMergeSemantic } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import Tooltip from '../tooltip';
import useMergedArrow from '../tooltip/hook/useMergedArrow';
import PurePanel, { Overlay } from './PurePanel';
// CSSINJS
import useStyle from './style';
const InternalPopover = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    title,
    content,
    overlayClassName,
    placement = 'top',
    trigger,
    children,
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    onOpenChange,
    overlayStyle = {},
    styles,
    classNames,
    motion,
    arrow: popoverArrow,
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
  } = useComponentConfig('popover');
  const prefixCls = getPrefixCls('popover', customizePrefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls);
  const rootPrefixCls = getPrefixCls();
  const mergedArrow = useMergedArrow(popoverArrow, contextArrow);
  const mergedTrigger = trigger || contextTrigger || 'hover';
  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Popover');
    process.env.NODE_ENV !== "production" ? warning(!onOpenChange || onOpenChange.length <= 1, 'usage', 'The second `onOpenChange` parameter is internal and unsupported. Please lock to a previous version if needed.') : void 0;
  }
  // ============================= Styles =============================
  const mergedProps = {
    ...props,
    placement,
    trigger: mergedTrigger,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayStyle,
    styles,
    classNames
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rootClassNames = clsx(overlayClassName, hashId, cssVarCls, contextClassName, mergedClassNames.root);
  const [open, setOpen] = useControlledState(props.defaultOpen ?? false, props.open);
  const settingOpen = value => {
    setOpen(value);
    onOpenChange?.(value);
  };
  const titleNode = getRenderPropValue(title);
  const contentNode = getRenderPropValue(content);
  return /*#__PURE__*/React.createElement(Tooltip, {
    unique: false,
    arrow: mergedArrow,
    placement: placement,
    trigger: mergedTrigger,
    mouseEnterDelay: mouseEnterDelay,
    mouseLeaveDelay: mouseLeaveDelay,
    ...restProps,
    prefixCls: prefixCls,
    classNames: {
      root: rootClassNames,
      container: mergedClassNames.container,
      arrow: mergedClassNames.arrow
    },
    styles: {
      root: {
        ...mergedStyles.root,
        ...contextStyle,
        ...overlayStyle
      },
      container: mergedStyles.container,
      arrow: mergedStyles.arrow
    },
    ref: ref,
    open: open,
    onOpenChange: settingOpen,
    overlay: titleNode || contentNode ? (/*#__PURE__*/React.createElement(Overlay, {
      prefixCls: prefixCls,
      title: titleNode,
      content: contentNode,
      classNames: mergedClassNames,
      styles: mergedStyles
    })) : null,
    motion: {
      motionName: getTransitionName(rootPrefixCls, 'zoom-big', typeof motion?.motionName === 'string' ? motion?.motionName : undefined)
    },
    "data-popover-inject": true
  }, children);
});
const Popover = InternalPopover;
Popover._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  Popover.displayName = 'Popover';
}
export default Popover;