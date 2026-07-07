"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import * as React from 'react';
import RcCascader from '@rc-component/cascader';
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
import useSelectIcons from '../select/useIcons';
import usePopupRender from '../select/usePopupRender';
import useShowArrow from '../select/useShowArrow';
import { useCompactItemContext } from '../space/Compact';
import useBase from './hooks/useBase';
import useCheckable from './hooks/useCheckable';
import CascaderPanel from './Panel';
import useStyle from './style';
import useIcons from './hooks/useIcons';
const {
  SHOW_CHILD,
  SHOW_PARENT
} = RcCascader;
const highlightKeyword = (str, lowerKeyword, prefixCls) => {
  const cells = str.toLowerCase().split(lowerKeyword).reduce((list, cur, index) => index === 0 ? [cur] : [].concat(_toConsumableArray(list), [lowerKeyword, cur]), []);
  const fillCells = [];
  let start = 0;
  cells.forEach((cell, index) => {
    const end = start + cell.length;
    let originWorld = str.slice(start, end);
    start = end;
    if (index % 2 === 1) {
      originWorld =
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("span", {
        className: `${prefixCls}-menu-item-keyword`,
        key: `separator-${index}`
      }, originWorld);
    }
    fillCells.push(originWorld);
  });
  return fillCells;
};
const defaultSearchRender = (inputValue, path, prefixCls, fieldNames) => {
  const optionList = [];
  // We do lower here to save perf
  const lower = inputValue.toLowerCase();
  path.forEach((node, index) => {
    if (index !== 0) {
      optionList.push(' / ');
    }
    let label = node[fieldNames.label];
    const type = typeof label;
    if (type === 'string' || type === 'number') {
      label = highlightKeyword(String(label), lower, prefixCls);
    }
    optionList.push(label);
  });
  return optionList;
};
const Cascader = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    size: customizeSize,
    disabled: customDisabled,
    className,
    rootClassName,
    multiple,
    bordered = true,
    transitionName,
    choiceTransitionName = '',
    popupClassName,
    expandIcon,
    placement,
    showSearch,
    allowClear = true,
    notFoundContent,
    direction,
    getPopupContainer,
    status: customStatus,
    showArrow,
    builtinPlacements,
    style,
    variant: customVariant,
    dropdownClassName,
    dropdownRender,
    onDropdownVisibleChange,
    onPopupVisibleChange,
    dropdownMenuColumnStyle,
    popupRender,
    dropdownStyle,
    popupMenuColumnStyle,
    onOpenChange,
    styles,
    classNames,
    loadingIcon,
    ...rest
  } = props;
  const restProps = omit(rest, ['suffixIcon']);
  const {
    getPrefixCls,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    expandIcon: contextExpandIcon,
    loadingIcon: contextLoadingIcon
  } = useComponentConfig('cascader');
  const {
    popupOverflow
  } = React.useContext(ConfigContext);
  // =================== Form =====================
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Cascader');
    // v5 deprecated dropdown api
    const deprecatedProps = {
      dropdownClassName: 'classNames.popup.root',
      dropdownStyle: 'styles.popup.root',
      dropdownRender: 'popupRender',
      dropdownMenuColumnStyle: 'popupMenuColumnStyle',
      onDropdownVisibleChange: 'onOpenChange',
      onPopupVisibleChange: 'onOpenChange',
      bordered: 'variant'
    };
    Object.entries(deprecatedProps).forEach(([oldProp, newProp]) => {
      warning.deprecated(!(oldProp in props), oldProp, newProp);
    });
    process.env.NODE_ENV !== "production" ? warning(!('showArrow' in props), 'deprecated', '`showArrow` is deprecated which will be removed in next major version. It will be a default behavior, you can hide it by setting `suffixIcon` to null.') : void 0;
  }
  // ==================== Prefix =====================
  const [prefixCls, cascaderPrefixCls, mergedDirection, renderEmpty] = useBase(customizePrefixCls, direction);
  const isRtl = mergedDirection === 'rtl';
  const rootPrefixCls = getPrefixCls();
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
  const cascaderRootCls = useCSSVarCls(cascaderPrefixCls);
  useStyle(cascaderPrefixCls, cascaderRootCls);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const [variant, enableVariantCls] = useVariant('cascader', customVariant, bordered);
  // =================== No Found ====================
  const mergedNotFoundContent = notFoundContent || renderEmpty?.('Cascader') || (/*#__PURE__*/React.createElement(DefaultRenderEmpty, {
    componentName: "Cascader"
  }));
  const mergedPopupRender = usePopupRender(popupRender || dropdownRender);
  const mergedPopupMenuColumnStyle = popupMenuColumnStyle || dropdownMenuColumnStyle;
  const mergedOnOpenChange = onOpenChange || onPopupVisibleChange || onDropdownVisibleChange;
  // ==================== Search =====================
  const mergedShowSearch = React.useMemo(() => {
    if (!showSearch) {
      return showSearch;
    }
    let searchConfig = {
      render: defaultSearchRender
    };
    if (typeof showSearch === 'object') {
      searchConfig = {
        ...searchConfig,
        ...showSearch
      };
    }
    return searchConfig;
  }, [showSearch]);
  // ===================== Size ======================
  const mergedSize = useSize(ctx => customizeSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;
  // ===================== Icon ======================
  const {
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon
  } = useIcons({
    contextExpandIcon,
    contextLoadingIcon,
    expandIcon,
    loadingIcon,
    isRtl
  });
  // =================== Multiple ====================
  const checkable = useCheckable(cascaderPrefixCls, multiple);
  // ===================== Icons =====================
  const showSuffixIcon = useShowArrow(props.suffixIcon, showArrow);
  const {
    suffixIcon,
    removeIcon,
    clearIcon
  } = useSelectIcons({
    ...props,
    loadingIcon: mergedLoadingIcon,
    hasFeedback,
    feedbackIcon,
    showSuffixIcon,
    multiple,
    prefixCls,
    componentName: 'Cascader'
  });
  // ===================== Placement =====================
  const memoPlacement = React.useMemo(() => {
    if (placement !== undefined) {
      return placement;
    }
    return isRtl ? 'bottomRight' : 'bottomLeft';
  }, [placement, isRtl]);
  const mergedAllowClear = allowClear === true ? {
    clearIcon
  } : allowClear;
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    variant,
    size: mergedSize,
    status: mergedStatus,
    disabled: mergedDisabled
  };
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  // =================== Dropdown ====================
  const mergedPopupStyle = {
    ...mergedStyles.popup?.root,
    ...dropdownStyle
  };
  // ============================ zIndex ============================
  const [zIndex] = useZIndex('SelectLike', mergedPopupStyle?.zIndex);
  const mergedPopupClassName = clsx(popupClassName || dropdownClassName, `${cascaderPrefixCls}-dropdown`, {
    [`${cascaderPrefixCls}-dropdown-rtl`]: mergedDirection === 'rtl'
  }, rootClassName, rootCls, mergedClassNames.popup?.root, cascaderRootCls, hashId, cssVarCls);
  // ==================== Render =====================
  return /*#__PURE__*/React.createElement(RcCascader, {
    prefixCls: prefixCls,
    className: clsx(!customizePrefixCls && cascaderPrefixCls, {
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: isRtl,
      [`${prefixCls}-${variant}`]: enableVariantCls,
      [`${prefixCls}-in-form-item`]: isFormItemInput
    }, getStatusClassNames(prefixCls, mergedStatus, hasFeedback), compactItemClassnames, contextClassName, className, rootClassName, mergedClassNames.root, rootCls, cascaderRootCls, hashId, cssVarCls),
    disabled: mergedDisabled,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    classNames: mergedClassNames,
    styles: mergedStyles,
    ...restProps,
    builtinPlacements: mergedBuiltinPlacements(builtinPlacements, popupOverflow),
    direction: mergedDirection,
    placement: memoPlacement,
    notFoundContent: mergedNotFoundContent,
    allowClear: mergedAllowClear,
    showSearch: mergedShowSearch,
    expandIcon: mergedExpandIcon,
    suffixIcon: suffixIcon,
    removeIcon: removeIcon,
    loadingIcon: mergedLoadingIcon,
    checkable: checkable,
    popupClassName: mergedPopupClassName,
    popupPrefixCls: customizePrefixCls || cascaderPrefixCls,
    popupStyle: {
      ...mergedPopupStyle,
      zIndex
    },
    popupRender: mergedPopupRender,
    popupMenuColumnStyle: mergedPopupMenuColumnStyle,
    onPopupVisibleChange: mergedOnOpenChange,
    choiceTransitionName: getTransitionName(rootPrefixCls, '', choiceTransitionName),
    transitionName: getTransitionName(rootPrefixCls, 'slide-up', transitionName),
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    ref: ref
  });
});
if (process.env.NODE_ENV !== 'production') {
  Cascader.displayName = 'Cascader';
}
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(Cascader, 'popupAlign', props => omit(props, ['visible']));
Cascader.SHOW_PARENT = SHOW_PARENT;
Cascader.SHOW_CHILD = SHOW_CHILD;
Cascader.Panel = CascaderPanel;
Cascader._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
export default Cascader;