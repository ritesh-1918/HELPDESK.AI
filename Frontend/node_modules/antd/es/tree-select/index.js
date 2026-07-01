"use client";

import * as React from 'react';
import RcTreeSelect, { SHOW_ALL, SHOW_CHILD, SHOW_PARENT, TreeNode } from '@rc-component/tree-select';
import { omit } from '@rc-component/util';
import { clsx } from 'clsx';
import { useMergeSemantic, useZIndex } from '../_util/hooks';
import { getTransitionName } from '../_util/motion';
import genPurePanel from '../_util/PurePanel';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import { devUseWarning } from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { useComponentConfig } from '../config-provider/context';
import DefaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import DisabledContext from '../config-provider/DisabledContext';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useSize from '../config-provider/hooks/useSize';
import { FormItemInputContext } from '../form/context';
import useVariant from '../form/hooks/useVariants';
import mergedBuiltinPlacements from '../select/mergedBuiltinPlacements';
import useSelectStyle from '../select/style';
import useIcons from '../select/useIcons';
import usePopupRender from '../select/usePopupRender';
import useShowArrow from '../select/useShowArrow';
import { useCompactItemContext } from '../space/Compact';
import { useToken } from '../theme/internal';
import SwitcherIconCom from '../tree/utils/iconUtil';
import useStyle from './style';
const InternalTreeSelect = (props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    size: customizeSize,
    disabled: customDisabled,
    bordered = true,
    style,
    className,
    rootClassName,
    treeCheckable,
    multiple,
    listHeight = 256,
    listItemHeight: customListItemHeight,
    placement,
    notFoundContent,
    switcherIcon: customSwitcherIcon,
    treeLine,
    getPopupContainer,
    popupClassName,
    dropdownClassName,
    treeIcon = false,
    transitionName,
    choiceTransitionName = '',
    status: customStatus,
    treeExpandAction,
    builtinPlacements,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    allowClear,
    variant: customVariant,
    dropdownStyle: _dropdownStyle,
    dropdownRender,
    popupRender,
    onDropdownVisibleChange,
    onOpenChange,
    tagRender,
    maxCount,
    showCheckedStrategy,
    treeCheckStrictly,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    getPopupContainer: getContextPopupContainer,
    direction,
    styles: contextStyles,
    classNames: contextClassNames,
    switcherIcon
  } = useComponentConfig('treeSelect');
  const {
    renderEmpty,
    virtual,
    popupMatchSelectWidth: contextPopupMatchSelectWidth,
    popupOverflow
  } = React.useContext(ConfigContext);
  const [, token] = useToken();
  const listItemHeight = customListItemHeight ?? token?.controlHeightSM + token?.paddingXXS;
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('TreeSelect');
    const deprecatedProps = {
      dropdownMatchSelectWidth: 'popupMatchSelectWidth',
      dropdownStyle: 'styles.popup.root',
      dropdownClassName: 'classNames.popup.root',
      popupClassName: 'classNames.popup.root',
      dropdownRender: 'popupRender',
      onDropdownVisibleChange: 'onOpenChange',
      bordered: 'variant'
    };
    Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
      warning.deprecated(!(oldProp in props), oldProp, newProp);
    });
    process.env.NODE_ENV !== "production" ? warning(multiple !== false || !treeCheckable, 'usage', '`multiple` will always be `true` when `treeCheckable` is true') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!('showArrow' in props), 'deprecated', '`showArrow` is deprecated which will be removed in next major version. It will be a default behavior, you can hide it by setting `suffixIcon` to null.') : void 0;
  }
  const rootPrefixCls = getPrefixCls();
  const prefixCls = getPrefixCls('select', customizePrefixCls);
  const treePrefixCls = getPrefixCls('select-tree', customizePrefixCls);
  const treeSelectPrefixCls = getPrefixCls('tree-select', customizePrefixCls);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const rootCls = useCSSVarCls(prefixCls);
  const treeSelectRootCls = useCSSVarCls(treeSelectPrefixCls);
  const [hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
  useStyle(treeSelectPrefixCls, treePrefixCls, treeSelectRootCls);
  const [variant, enableVariantCls] = useVariant('treeSelect', customVariant, bordered);
  // ===================== Size =====================
  const mergedSize = useSize(ctx => customizeSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  // ===================== Form =====================
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled,
    status: mergedStatus,
    variant
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  const mergedPopupClassName = clsx(popupClassName || dropdownClassName, `${treeSelectPrefixCls}-dropdown`, {
    [`${treeSelectPrefixCls}-dropdown-rtl`]: direction === 'rtl'
  }, rootClassName, mergedClassNames.root, mergedClassNames.popup?.root, cssVarCls, rootCls, treeSelectRootCls, hashId);
  const mergedPopupRender = usePopupRender(popupRender || dropdownRender);
  const mergedOnOpenChange = onOpenChange || onDropdownVisibleChange;
  const isMultiple = !!(treeCheckable || multiple);
  const mergedMaxCount = React.useMemo(() => {
    if (maxCount && (showCheckedStrategy === 'SHOW_ALL' && !treeCheckStrictly || showCheckedStrategy === 'SHOW_PARENT')) {
      return undefined;
    }
    return maxCount;
  }, [maxCount, showCheckedStrategy, treeCheckStrictly]);
  const showSuffixIcon = useShowArrow(props.suffixIcon, props.showArrow);
  const mergedPopupMatchSelectWidth = popupMatchSelectWidth ?? dropdownMatchSelectWidth ?? contextPopupMatchSelectWidth;
  // ===================== Icons =====================
  const {
    suffixIcon,
    removeIcon,
    clearIcon
  } = useIcons({
    ...restProps,
    multiple: isMultiple,
    showSuffixIcon,
    hasFeedback,
    feedbackIcon,
    prefixCls,
    componentName: 'TreeSelect'
  });
  const mergedAllowClear = allowClear === true ? {
    clearIcon
  } : allowClear;
  // ===================== Empty =====================
  let mergedNotFound;
  if (notFoundContent !== undefined) {
    mergedNotFound = notFoundContent;
  } else {
    mergedNotFound = renderEmpty?.('Select') || /*#__PURE__*/React.createElement(DefaultRenderEmpty, {
      componentName: "Select"
    });
  }
  // ==================== Render =====================
  const selectProps = omit(restProps, ['suffixIcon', 'removeIcon', 'clearIcon', 'itemIcon', 'switcherIcon', 'style']);
  // ===================== Placement =====================
  const memoizedPlacement = React.useMemo(() => {
    if (placement !== undefined) {
      return placement;
    }
    return direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
  }, [placement, direction]);
  const mergedClassName = clsx(!customizePrefixCls && treeSelectPrefixCls, {
    [`${prefixCls}-lg`]: mergedSize === 'large',
    [`${prefixCls}-sm`]: mergedSize === 'small',
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-${variant}`]: enableVariantCls,
    [`${prefixCls}-in-form-item`]: isFormItemInput
  }, getStatusClassNames(prefixCls, mergedStatus, hasFeedback), compactItemClassnames, className, rootClassName, mergedClassNames?.root, cssVarCls, rootCls, treeSelectRootCls, hashId);
  const mergedSwitcherIcon = customSwitcherIcon ?? switcherIcon;
  const renderSwitcherIcon = nodeProps => (/*#__PURE__*/React.createElement(SwitcherIconCom, {
    prefixCls: treePrefixCls,
    switcherIcon: mergedSwitcherIcon,
    treeNodeProps: nodeProps,
    showLine: treeLine
  }));
  // ============================ zIndex ============================
  const [zIndex] = useZIndex('SelectLike', mergedStyles.popup?.root?.zIndex);
  return /*#__PURE__*/React.createElement(RcTreeSelect, {
    classNames: mergedClassNames,
    styles: mergedStyles,
    virtual: virtual,
    disabled: mergedDisabled,
    ...selectProps,
    popupMatchSelectWidth: mergedPopupMatchSelectWidth,
    builtinPlacements: mergedBuiltinPlacements(builtinPlacements, popupOverflow),
    ref: ref,
    prefixCls: prefixCls,
    className: mergedClassName,
    style: {
      ...mergedStyles?.root,
      ...style
    },
    listHeight: listHeight,
    listItemHeight: listItemHeight,
    treeCheckable: treeCheckable ? /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-tree-checkbox-inner`
    }) : treeCheckable,
    treeLine: !!treeLine,
    suffixIcon: suffixIcon,
    multiple: isMultiple,
    placement: memoizedPlacement,
    removeIcon: removeIcon,
    allowClear: mergedAllowClear,
    switcherIcon: renderSwitcherIcon,
    showTreeIcon: treeIcon,
    notFoundContent: mergedNotFound,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    treeMotion: null,
    popupClassName: mergedPopupClassName,
    popupStyle: {
      ...mergedStyles.root,
      ...mergedStyles.popup?.root,
      zIndex
    },
    popupRender: mergedPopupRender,
    onPopupVisibleChange: mergedOnOpenChange,
    choiceTransitionName: getTransitionName(rootPrefixCls, '', choiceTransitionName),
    transitionName: getTransitionName(rootPrefixCls, 'slide-up', transitionName),
    treeExpandAction: treeExpandAction,
    tagRender: isMultiple ? tagRender : undefined,
    maxCount: mergedMaxCount,
    showCheckedStrategy: showCheckedStrategy,
    treeCheckStrictly: treeCheckStrictly
  });
};
const TreeSelectRef = /*#__PURE__*/React.forwardRef(InternalTreeSelect);
const TreeSelect = TreeSelectRef;
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(TreeSelect, 'popupAlign', props => omit(props, ['visible']));
TreeSelect.TreeNode = TreeNode;
TreeSelect.SHOW_ALL = SHOW_ALL;
TreeSelect.SHOW_PARENT = SHOW_PARENT;
TreeSelect.SHOW_CHILD = SHOW_CHILD;
TreeSelect._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  TreeSelect.displayName = 'TreeSelect';
}
export { TreeNode };
export default TreeSelect;