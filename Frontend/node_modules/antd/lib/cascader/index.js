"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
var _cascader = _interopRequireDefault(require("@rc-component/cascader"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _motion = require("../_util/motion");
var _PurePanel = _interopRequireDefault(require("../_util/PurePanel"));
var _statusUtils = require("../_util/statusUtils");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _defaultRenderEmpty = _interopRequireDefault(require("../config-provider/defaultRenderEmpty"));
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _context2 = require("../form/context");
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
var _mergedBuiltinPlacements = _interopRequireDefault(require("../select/mergedBuiltinPlacements"));
var _style = _interopRequireDefault(require("../select/style"));
var _useIcons = _interopRequireDefault(require("../select/useIcons"));
var _usePopupRender = _interopRequireDefault(require("../select/usePopupRender"));
var _useShowArrow = _interopRequireDefault(require("../select/useShowArrow"));
var _Compact = require("../space/Compact");
var _useBase = _interopRequireDefault(require("./hooks/useBase"));
var _useCheckable = _interopRequireDefault(require("./hooks/useCheckable"));
var _Panel = _interopRequireDefault(require("./Panel"));
var _style2 = _interopRequireDefault(require("./style"));
var _useIcons2 = _interopRequireDefault(require("./hooks/useIcons"));
const {
  SHOW_CHILD,
  SHOW_PARENT
} = _cascader.default;
const highlightKeyword = (str, lowerKeyword, prefixCls) => {
  const cells = str.toLowerCase().split(lowerKeyword).reduce((list, cur, index) => index === 0 ? [cur] : [].concat((0, _toConsumableArray2.default)(list), [lowerKeyword, cur]), []);
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
  const restProps = (0, _util.omit)(rest, ['suffixIcon']);
  const {
    getPrefixCls,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    expandIcon: contextExpandIcon,
    loadingIcon: contextLoadingIcon
  } = (0, _context.useComponentConfig)('cascader');
  const {
    popupOverflow
  } = React.useContext(_configProvider.ConfigContext);
  // =================== Form =====================
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(contextStatus, customStatus);
  // =================== Warning =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Cascader');
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
  const [prefixCls, cascaderPrefixCls, mergedDirection, renderEmpty] = (0, _useBase.default)(customizePrefixCls, direction);
  const isRtl = mergedDirection === 'rtl';
  const rootPrefixCls = getPrefixCls();
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const cascaderRootCls = (0, _useCSSVarCls.default)(cascaderPrefixCls);
  (0, _style2.default)(cascaderPrefixCls, cascaderRootCls);
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  const [variant, enableVariantCls] = (0, _useVariants.default)('cascader', customVariant, bordered);
  // =================== No Found ====================
  const mergedNotFoundContent = notFoundContent || renderEmpty?.('Cascader') || (/*#__PURE__*/React.createElement(_defaultRenderEmpty.default, {
    componentName: "Cascader"
  }));
  const mergedPopupRender = (0, _usePopupRender.default)(popupRender || dropdownRender);
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
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  // ===================== Icon ======================
  const {
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon
  } = (0, _useIcons2.default)({
    contextExpandIcon,
    contextLoadingIcon,
    expandIcon,
    loadingIcon,
    isRtl
  });
  // =================== Multiple ====================
  const checkable = (0, _useCheckable.default)(cascaderPrefixCls, multiple);
  // ===================== Icons =====================
  const showSuffixIcon = (0, _useShowArrow.default)(props.suffixIcon, showArrow);
  const {
    suffixIcon,
    removeIcon,
    clearIcon
  } = (0, _useIcons.default)({
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
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
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
  const [zIndex] = (0, _hooks.useZIndex)('SelectLike', mergedPopupStyle?.zIndex);
  const mergedPopupClassName = (0, _clsx.clsx)(popupClassName || dropdownClassName, `${cascaderPrefixCls}-dropdown`, {
    [`${cascaderPrefixCls}-dropdown-rtl`]: mergedDirection === 'rtl'
  }, rootClassName, rootCls, mergedClassNames.popup?.root, cascaderRootCls, hashId, cssVarCls);
  // ==================== Render =====================
  return /*#__PURE__*/React.createElement(_cascader.default, {
    prefixCls: prefixCls,
    className: (0, _clsx.clsx)(!customizePrefixCls && cascaderPrefixCls, {
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: isRtl,
      [`${prefixCls}-${variant}`]: enableVariantCls,
      [`${prefixCls}-in-form-item`]: isFormItemInput
    }, (0, _statusUtils.getStatusClassNames)(prefixCls, mergedStatus, hasFeedback), compactItemClassnames, contextClassName, className, rootClassName, mergedClassNames.root, rootCls, cascaderRootCls, hashId, cssVarCls),
    disabled: mergedDisabled,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    classNames: mergedClassNames,
    styles: mergedStyles,
    ...restProps,
    builtinPlacements: (0, _mergedBuiltinPlacements.default)(builtinPlacements, popupOverflow),
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
    choiceTransitionName: (0, _motion.getTransitionName)(rootPrefixCls, '', choiceTransitionName),
    transitionName: (0, _motion.getTransitionName)(rootPrefixCls, 'slide-up', transitionName),
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    ref: ref
  });
});
if (process.env.NODE_ENV !== 'production') {
  Cascader.displayName = 'Cascader';
}
// We don't care debug panel
/* istanbul ignore next */
const PurePanel = (0, _PurePanel.default)(Cascader, 'popupAlign', props => (0, _util.omit)(props, ['visible']));
Cascader.SHOW_PARENT = SHOW_PARENT;
Cascader.SHOW_CHILD = SHOW_CHILD;
Cascader.Panel = _Panel.default;
Cascader._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
var _default = exports.default = Cascader;