"use client";

import * as React from 'react';
import RcTooltip from '@rc-component/tooltip';
import { useControlledState } from '@rc-component/util';
import { clsx } from 'clsx';
import ContextIsolator from '../_util/ContextIsolator';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import getPlacements from '../_util/placements';
import { cloneElement, isFragment } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import ZIndexContext from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useToken } from '../theme/internal';
import useMergedArrow from './hook/useMergedArrow';
import PurePanel from './PurePanel';
import useStyle from './style';
import UniqueProvider from './UniqueProvider';
import { parseColor } from './util';
const InternalTooltip = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    openClassName,
    getTooltipContainer,
    color,
    children,
    afterOpenChange,
    arrow: tooltipArrow,
    destroyTooltipOnHide,
    destroyOnHidden,
    title,
    overlay,
    trigger,
    builtinPlacements,
    autoAdjustOverflow = true,
    motion,
    getPopupContainer,
    placement = 'top',
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    rootClassName,
    styles,
    classNames,
    onOpenChange,
    // Legacy
    overlayInnerStyle,
    overlayStyle,
    overlayClassName,
    ...restProps
  } = props;
  const [, token] = useToken();
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    arrow: contextArrow,
    trigger: contextTrigger
  } = useComponentConfig('tooltip');
  const mergedArrow = useMergedArrow(tooltipArrow, contextArrow);
  const mergedShowArrow = mergedArrow.show;
  const mergedTrigger = trigger || contextTrigger || 'hover';
  // ============================== Ref ===============================
  const warning = devUseWarning('Tooltip');
  const tooltipRef = React.useRef(null);
  const forceAlign = () => {
    tooltipRef.current?.forceAlign();
  };
  React.useImperativeHandle(ref, () => ({
    forceAlign,
    nativeElement: tooltipRef.current?.nativeElement,
    popupElement: tooltipRef.current?.popupElement
  }));
  // ============================== Warn ==============================
  if (process.env.NODE_ENV !== 'production') {
    [['overlayStyle', 'styles.root'], ['overlayInnerStyle', 'styles.container'], ['overlayClassName', 'classNames.root'], ['destroyTooltipOnHide', 'destroyOnHidden']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    process.env.NODE_ENV !== "production" ? warning(!destroyTooltipOnHide || typeof destroyTooltipOnHide === 'boolean', 'usage', '`destroyTooltipOnHide` no need config `keepParent` anymore. Please use `boolean` value directly.') : void 0;
  }
  // ============================== Open ==============================
  const [open, setOpen] = useControlledState(props.defaultOpen ?? false, props.open);
  const noTitle = !title && !overlay && title !== 0; // overlay for old version compatibility
  const onInternalOpenChange = vis => {
    setOpen(noTitle ? false : vis);
    if (!noTitle && onOpenChange) {
      onOpenChange(vis);
    }
  };
  const tooltipPlacements = React.useMemo(() => {
    return builtinPlacements || getPlacements({
      arrowPointAtCenter: mergedArrow?.pointAtCenter ?? false,
      autoAdjustOverflow,
      arrowWidth: mergedShowArrow ? token.sizePopupArrow : 0,
      borderRadius: token.borderRadius,
      offset: token.marginXXS,
      visibleFirst: true
    });
  }, [mergedArrow, builtinPlacements, token, mergedShowArrow, autoAdjustOverflow]);
  const memoOverlay = React.useMemo(() => {
    if (title === 0) {
      return title;
    }
    return overlay || title || '';
  }, [overlay, title]);
  const memoOverlayWrapper = /*#__PURE__*/React.createElement(ContextIsolator, {
    space: true,
    form: true
  }, typeof memoOverlay === 'function' ? memoOverlay() : memoOverlay);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    trigger: mergedTrigger,
    color,
    placement,
    builtinPlacements,
    openClassName,
    arrow: tooltipArrow,
    autoAdjustOverflow,
    getPopupContainer,
    children,
    destroyTooltipOnHide,
    destroyOnHidden
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const injectFromPopover = props['data-popover-inject'];
  let tempOpen = open;
  // Hide tooltip when there is no title
  if (!('open' in props) && noTitle) {
    tempOpen = false;
  }
  // ============================= Render =============================
  const child = /*#__PURE__*/React.isValidElement(children) && !isFragment(children) ? children : /*#__PURE__*/React.createElement("span", null, children);
  const childProps = child.props;
  const childCls = !childProps.className || typeof childProps.className === 'string' ? clsx(childProps.className, openClassName || `${prefixCls}-open`) : childProps.className;
  // Style
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls, !injectFromPopover);
  // Color
  const colorInfo = parseColor(rootPrefixCls, prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const themeCls = clsx(rootCls, hashId, cssVarCls);
  const rootClassNames = clsx(overlayClassName, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, colorInfo.className, rootClassName, themeCls, contextClassName, mergedClassNames.root);
  // ============================ zIndex ============================
  const [zIndex, contextZIndex] = useZIndex('Tooltip', restProps.zIndex);
  const containerStyle = {
    ...mergedStyles.container,
    ...overlayInnerStyle,
    ...colorInfo.overlayStyle
  };
  const content = /*#__PURE__*/React.createElement(RcTooltip, {
    unique: true,
    ...restProps,
    trigger: mergedTrigger,
    zIndex: zIndex,
    showArrow: mergedShowArrow,
    placement: placement,
    mouseEnterDelay: mouseEnterDelay,
    mouseLeaveDelay: mouseLeaveDelay,
    prefixCls: prefixCls,
    classNames: {
      root: rootClassNames,
      container: mergedClassNames.container,
      arrow: mergedClassNames.arrow,
      uniqueContainer: clsx(themeCls, mergedClassNames.container)
    },
    styles: {
      root: {
        ...arrowContentStyle,
        ...mergedStyles.root,
        ...contextStyle,
        ...overlayStyle
      },
      container: containerStyle,
      uniqueContainer: containerStyle,
      arrow: mergedStyles.arrow
    },
    getTooltipContainer: getPopupContainer || getTooltipContainer || getContextPopupContainer,
    ref: tooltipRef,
    builtinPlacements: tooltipPlacements,
    overlay: memoOverlayWrapper,
    visible: tempOpen,
    onVisibleChange: onInternalOpenChange,
    afterVisibleChange: afterOpenChange,
    arrowContent: /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-arrow-content`
    }),
    motion: {
      motionName: getTransitionName(rootPrefixCls, 'zoom-big-fast', typeof motion?.motionName === 'string' ? motion?.motionName : undefined),
      motionDeadline: 1000
    },
    destroyOnHidden: destroyOnHidden ?? !!destroyTooltipOnHide
  }, tempOpen ? cloneElement(child, {
    className: childCls
  }) : child);
  return /*#__PURE__*/React.createElement(ZIndexContext.Provider, {
    value: contextZIndex
  }, content);
});
const Tooltip = InternalTooltip;
if (process.env.NODE_ENV !== 'production') {
  Tooltip.displayName = 'Tooltip';
}
Tooltip._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
Tooltip.UniqueProvider = UniqueProvider;
export default Tooltip;