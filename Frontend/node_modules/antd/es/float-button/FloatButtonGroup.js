"use client";

import React from 'react';
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import FileTextOutlined from "@ant-design/icons/es/icons/FileTextOutlined";
import CSSMotion from '@rc-component/motion';
import { useControlledState, useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Flex from '../flex';
import Space from '../space';
import { GroupContext } from './context';
import FloatButton, { floatButtonPrefixCls } from './FloatButton';
import useStyle from './style';
const FloatButtonGroup = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    classNames,
    styles,
    rootClassName,
    shape = 'circle',
    type = 'default',
    placement,
    icon = /*#__PURE__*/React.createElement(FileTextOutlined, null),
    closeIcon,
    trigger,
    children,
    onOpenChange,
    open: customOpen,
    onClick: onTriggerButtonClick,
    ...floatButtonProps
  } = props;
  const {
    direction,
    getPrefixCls,
    closeIcon: contextCloseIcon,
    classNames: contextClassNames,
    styles: contextStyles,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig('floatButtonGroup');
  const mergedCloseIcon = closeIcon ?? contextCloseIcon ?? /*#__PURE__*/React.createElement(CloseOutlined, null);
  const prefixCls = getPrefixCls(floatButtonPrefixCls, customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const isMenuMode = trigger && ['click', 'hover'].includes(trigger);
  // ============================ zIndex ============================
  const [zIndex] = useZIndex('FloatButton', style?.zIndex);
  // ============================= Refs =============================
  const floatButtonGroupRef = React.useRef(null);
  // ========================== Placement ==========================
  const mergedPlacement = ['top', 'left', 'right', 'bottom'].includes(placement) ? placement : 'top';
  // ========================== Open ==========================
  const [open, setOpen] = useControlledState(false, customOpen);
  const hoverTrigger = trigger === 'hover';
  const clickTrigger = trigger === 'click';
  const triggerOpen = useEvent(nextOpen => {
    if (open !== nextOpen) {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    }
  });
  // ===================== Trigger: Hover =====================
  const onMouseEnter = () => {
    if (hoverTrigger) {
      triggerOpen(true);
    }
  };
  const onMouseLeave = () => {
    if (hoverTrigger) {
      triggerOpen(false);
    }
  };
  // ===================== Trigger: Click =====================
  const onInternalTriggerButtonClick = e => {
    if (clickTrigger) {
      triggerOpen(!open);
    }
    onTriggerButtonClick?.(e);
  };
  React.useEffect(() => {
    if (clickTrigger) {
      const onDocClick = e => {
        // Skip if click on the group
        if (floatButtonGroupRef.current?.contains(e.target)) {
          return;
        }
        triggerOpen(false);
      };
      document.addEventListener('click', onDocClick, {
        capture: true
      });
      return () => document.removeEventListener('click', onDocClick, {
        capture: true
      });
    }
  }, [clickTrigger]);
  // ======================== Warning =========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('FloatButton.Group');
    process.env.NODE_ENV !== "production" ? warning(!('open' in props) || !!trigger, 'usage', '`open` need to be used together with `trigger`') : void 0;
  }
  // ======================== Contexts ========================
  const individual = shape === 'circle';
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    shape,
    type,
    placement: mergedPlacement
  };
  // ============================ Styles ============================
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const listContext = React.useMemo(() => ({
    shape,
    individual,
    classNames: {
      root: mergedClassNames.item,
      icon: mergedClassNames.itemIcon,
      content: mergedClassNames.itemContent
    },
    styles: {
      root: mergedStyles.item,
      icon: mergedStyles.itemIcon,
      content: mergedStyles.itemContent
    }
  }), [shape, individual, mergedClassNames, mergedStyles]);
  const triggerContext = React.useMemo(() => ({
    ...listContext,
    individual: true,
    classNames: {
      root: mergedClassNames.trigger,
      icon: mergedClassNames.triggerIcon,
      content: mergedClassNames.triggerContent
    },
    styles: {
      root: mergedStyles.trigger,
      icon: mergedStyles.triggerIcon,
      content: mergedStyles.triggerContent
    }
  }), [listContext, mergedClassNames, mergedStyles]);
  // ========================= Render =========================
  // >>> List
  let listNode;
  const listCls = `${groupPrefixCls}-list`;
  const renderList = motionClassName => {
    const vertical = mergedPlacement === 'top' || mergedPlacement === 'bottom';
    const sharedProps = {
      className: clsx(listCls, mergedClassNames.list, motionClassName),
      style: mergedStyles.list
    };
    if (individual) {
      listNode = /*#__PURE__*/React.createElement(Flex, {
        vertical: vertical,
        ...sharedProps
      }, children);
    } else {
      listNode = /*#__PURE__*/React.createElement(Space.Compact, {
        vertical: vertical,
        ...sharedProps
      }, children);
    }
    return listNode;
  };
  // >>> Render
  return /*#__PURE__*/React.createElement(GroupContext.Provider, {
    value: listContext
  }, /*#__PURE__*/React.createElement("div", {
    className: clsx(groupPrefixCls, hashId, cssVarCls, rootCls, contextClassName, mergedClassNames.root, className, rootClassName, {
      [`${groupPrefixCls}-rtl`]: direction === 'rtl',
      [`${groupPrefixCls}-individual`]: individual,
      [`${groupPrefixCls}-${mergedPlacement}`]: isMenuMode,
      [`${groupPrefixCls}-menu-mode`]: isMenuMode
    }),
    style: {
      ...contextStyle,
      zIndex,
      ...mergedStyles.root,
      ...style
    },
    // ref
    ref: floatButtonGroupRef,
    // Hover trigger
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave
  }, isMenuMode ? (/*#__PURE__*/React.createElement(CSSMotion, {
    visible: open,
    motionName: `${listCls}-motion`
  }, ({
    className: motionClassName
  }) => renderList(motionClassName))) : renderList(), isMenuMode && (/*#__PURE__*/React.createElement(GroupContext.Provider, {
    value: triggerContext
  }, /*#__PURE__*/React.createElement(FloatButton, {
    type: type,
    icon: open ? mergedCloseIcon : icon,
    "aria-label": props['aria-label'],
    className: `${groupPrefixCls}-trigger`,
    onClick: onInternalTriggerButtonClick,
    ...floatButtonProps
  })))));
};
export default FloatButtonGroup;