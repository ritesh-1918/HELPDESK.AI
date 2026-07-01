"use client";

import * as React from 'react';
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import RcDropdown from '@rc-component/dropdown';
import { omit, useControlledState, useEvent } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import isPrimitive from '../_util/isPrimitive';
import getPlacements from '../_util/placements';
import genPurePanel from '../_util/PurePanel';
import { cloneElement } from '../_util/reactNode';
import { devUseWarning } from '../_util/warning';
import zIndexContext from '../_util/zindexContext';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Menu from '../menu';
import { OverrideProvider } from '../menu/OverrideContext';
import { useToken } from '../theme/internal';
import useStyle from './style';
const _Placements = ['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight', 'top', 'bottom'];
const Dropdown = props => {
  const {
    menu,
    arrow,
    prefixCls: customizePrefixCls,
    children,
    trigger,
    disabled,
    dropdownRender,
    popupRender,
    getPopupContainer,
    overlayClassName,
    rootClassName,
    overlayStyle,
    open,
    onOpenChange,
    mouseEnterDelay = 0.15,
    mouseLeaveDelay = 0.1,
    autoAdjustOverflow = true,
    placement = '',
    transitionName,
    classNames,
    styles,
    destroyPopupOnHide,
    destroyOnHidden
  } = props;
  const {
    getPrefixCls,
    direction,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig('dropdown');
  const mergedProps = {
    ...props,
    mouseEnterDelay,
    mouseLeaveDelay,
    autoAdjustOverflow
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const mergedRootStyles = {
    ...contextStyle,
    ...overlayStyle,
    ...mergedStyles.root
  };
  const mergedPopupRender = popupRender || dropdownRender;
  // =================== Warning =====================
  const warning = devUseWarning('Dropdown');
  if (process.env.NODE_ENV !== 'production') {
    const deprecatedProps = {
      dropdownRender: 'popupRender',
      destroyPopupOnHide: 'destroyOnHidden',
      overlayClassName: 'classNames.root',
      overlayStyle: 'styles.root'
    };
    Object.entries(deprecatedProps).forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    if (placement.includes('Center')) {
      warning.deprecated(!placement.includes('Center'), `placement: ${placement}`, `placement: ${placement.slice(0, placement.indexOf('Center'))}`);
    }
  }
  const memoTransitionName = React.useMemo(() => {
    const rootPrefixCls = getPrefixCls();
    if (transitionName !== undefined) {
      return transitionName;
    }
    if (placement.includes('top')) {
      return `${rootPrefixCls}-slide-down`;
    }
    return `${rootPrefixCls}-slide-up`;
  }, [getPrefixCls, placement, transitionName]);
  const memoPlacement = React.useMemo(() => {
    if (!placement) {
      return direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
    }
    if (placement.includes('Center')) {
      return placement.slice(0, placement.indexOf('Center'));
    }
    return placement;
  }, [placement, direction]);
  const prefixCls = getPrefixCls('dropdown', customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const [, token] = useToken();
  const child = React.Children.only(isPrimitive(children) ? /*#__PURE__*/React.createElement("span", null, children) : children);
  const popupTrigger = cloneElement(child, {
    className: clsx(`${prefixCls}-trigger`, {
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }, child.props.className),
    disabled: child.props.disabled ?? disabled
  });
  const triggerActions = disabled ? [] : trigger;
  const alignPoint = !!triggerActions?.includes('contextMenu');
  // =========================== Open ============================
  const [mergedOpen, setOpen] = useControlledState(false, open);
  const onInnerOpenChange = useEvent(nextOpen => {
    onOpenChange?.(nextOpen, {
      source: 'trigger'
    });
    setOpen(nextOpen);
  });
  // =========================== Overlay ============================
  const overlayClassNameCustomized = clsx(overlayClassName, rootClassName, hashId, cssVarCls, rootCls, contextClassName, mergedClassNames.root, {
    [`${prefixCls}-rtl`]: direction === 'rtl'
  });
  const builtinPlacements = getPlacements({
    arrowPointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter,
    autoAdjustOverflow,
    offset: token.marginXXS,
    arrowWidth: arrow ? token.sizePopupArrow : 0,
    borderRadius: token.borderRadius
  });
  const onMenuClick = useEvent(() => {
    if (menu?.selectable && menu?.multiple) {
      return;
    }
    onOpenChange?.(false, {
      source: 'menu'
    });
    setOpen(false);
  });
  const renderOverlay = () => {
    // @rc-component/dropdown already can process the function of overlay, but we have check logic here.
    // So we need render the element to check and pass back to @rc-component/dropdown.
    const menuClassNames = omit(mergedClassNames, ['root']);
    const menuStyles = omit(mergedStyles, ['root']);
    let overlayNode;
    if (menu?.items) {
      overlayNode = /*#__PURE__*/React.createElement(Menu, {
        ...menu,
        classNames: {
          ...menuClassNames,
          subMenu: {
            ...menuClassNames
          }
        },
        styles: {
          ...menuStyles,
          subMenu: {
            ...menuStyles
          }
        }
      });
    }
    if (mergedPopupRender) {
      overlayNode = mergedPopupRender(overlayNode);
    }
    overlayNode = React.Children.only(typeof overlayNode === 'string' ? /*#__PURE__*/React.createElement("span", null, overlayNode) : overlayNode);
    return /*#__PURE__*/React.createElement(OverrideProvider, {
      prefixCls: `${prefixCls}-menu`,
      rootClassName: clsx(cssVarCls, rootCls),
      expandIcon: /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-menu-submenu-arrow`
      }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(LeftOutlined, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      })) : (/*#__PURE__*/React.createElement(RightOutlined, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      }))),
      mode: "vertical",
      selectable: false,
      onClick: onMenuClick,
      validator: ({
        mode
      }) => {
        // Warning if use other mode
        process.env.NODE_ENV !== "production" ? warning(!mode || mode === 'vertical', 'usage', `mode="${mode}" is not supported for Dropdown's Menu.`) : void 0;
      }
    }, overlayNode);
  };
  // =========================== zIndex ============================
  const [zIndex, contextZIndex] = useZIndex('Dropdown', mergedRootStyles.zIndex);
  // ============================ Render ============================
  let renderNode = /*#__PURE__*/React.createElement(RcDropdown, {
    alignPoint: alignPoint,
    ...omit(props, ['rootClassName', 'onOpenChange']),
    mouseEnterDelay: mouseEnterDelay,
    mouseLeaveDelay: mouseLeaveDelay,
    visible: mergedOpen,
    builtinPlacements: builtinPlacements,
    arrow: !!arrow,
    overlayClassName: overlayClassNameCustomized,
    prefixCls: prefixCls,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    transitionName: memoTransitionName,
    trigger: triggerActions,
    overlay: renderOverlay,
    placement: memoPlacement,
    onVisibleChange: onInnerOpenChange,
    overlayStyle: {
      ...mergedRootStyles,
      zIndex
    },
    autoDestroy: destroyOnHidden ?? destroyPopupOnHide
  }, popupTrigger);
  if (zIndex) {
    renderNode = /*#__PURE__*/React.createElement(zIndexContext.Provider, {
      value: contextZIndex
    }, renderNode);
  }
  return renderNode;
};
// We don't care debug panel
const PurePanel = genPurePanel(Dropdown, 'align', undefined, 'dropdown', prefixCls => prefixCls);
/* istanbul ignore next */
const WrapPurePanel = props => (/*#__PURE__*/React.createElement(PurePanel, {
  ...props
}, /*#__PURE__*/React.createElement("span", null)));
Dropdown._InternalPanelDoNotUseOrYouWillBeFired = WrapPurePanel;
if (process.env.NODE_ENV !== 'production') {
  Dropdown.displayName = 'Dropdown';
}
export default Dropdown;