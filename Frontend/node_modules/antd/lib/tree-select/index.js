"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TreeNode", {
  enumerable: true,
  get: function () {
    return _treeSelect.TreeNode;
  }
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _treeSelect = _interopRequireWildcard(require("@rc-component/tree-select"));
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
var _internal = require("../theme/internal");
var _iconUtil = _interopRequireDefault(require("../tree/utils/iconUtil"));
var _style2 = _interopRequireDefault(require("./style"));
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
  } = (0, _context.useComponentConfig)('treeSelect');
  const {
    renderEmpty,
    virtual,
    popupMatchSelectWidth: contextPopupMatchSelectWidth,
    popupOverflow
  } = React.useContext(_configProvider.ConfigContext);
  const [, token] = (0, _internal.useToken)();
  const listItemHeight = customListItemHeight ?? token?.controlHeightSM + token?.paddingXXS;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('TreeSelect');
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
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const treeSelectRootCls = (0, _useCSSVarCls.default)(treeSelectPrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  (0, _style2.default)(treeSelectPrefixCls, treePrefixCls, treeSelectRootCls);
  const [variant, enableVariantCls] = (0, _useVariants.default)('treeSelect', customVariant, bordered);
  // ===================== Size =====================
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
  // ===================== Disabled =====================
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  // ===================== Form =====================
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = React.useContext(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(contextStatus, customStatus);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size: mergedSize,
    disabled: mergedDisabled,
    status: mergedStatus,
    variant
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  const mergedPopupClassName = (0, _clsx.clsx)(popupClassName || dropdownClassName, `${treeSelectPrefixCls}-dropdown`, {
    [`${treeSelectPrefixCls}-dropdown-rtl`]: direction === 'rtl'
  }, rootClassName, mergedClassNames.root, mergedClassNames.popup?.root, cssVarCls, rootCls, treeSelectRootCls, hashId);
  const mergedPopupRender = (0, _usePopupRender.default)(popupRender || dropdownRender);
  const mergedOnOpenChange = onOpenChange || onDropdownVisibleChange;
  const isMultiple = !!(treeCheckable || multiple);
  const mergedMaxCount = React.useMemo(() => {
    if (maxCount && (showCheckedStrategy === 'SHOW_ALL' && !treeCheckStrictly || showCheckedStrategy === 'SHOW_PARENT')) {
      return undefined;
    }
    return maxCount;
  }, [maxCount, showCheckedStrategy, treeCheckStrictly]);
  const showSuffixIcon = (0, _useShowArrow.default)(props.suffixIcon, props.showArrow);
  const mergedPopupMatchSelectWidth = popupMatchSelectWidth ?? dropdownMatchSelectWidth ?? contextPopupMatchSelectWidth;
  // ===================== Icons =====================
  const {
    suffixIcon,
    removeIcon,
    clearIcon
  } = (0, _useIcons.default)({
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
    mergedNotFound = renderEmpty?.('Select') || /*#__PURE__*/React.createElement(_defaultRenderEmpty.default, {
      componentName: "Select"
    });
  }
  // ==================== Render =====================
  const selectProps = (0, _util.omit)(restProps, ['suffixIcon', 'removeIcon', 'clearIcon', 'itemIcon', 'switcherIcon', 'style']);
  // ===================== Placement =====================
  const memoizedPlacement = React.useMemo(() => {
    if (placement !== undefined) {
      return placement;
    }
    return direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
  }, [placement, direction]);
  const mergedClassName = (0, _clsx.clsx)(!customizePrefixCls && treeSelectPrefixCls, {
    [`${prefixCls}-lg`]: mergedSize === 'large',
    [`${prefixCls}-sm`]: mergedSize === 'small',
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-${variant}`]: enableVariantCls,
    [`${prefixCls}-in-form-item`]: isFormItemInput
  }, (0, _statusUtils.getStatusClassNames)(prefixCls, mergedStatus, hasFeedback), compactItemClassnames, className, rootClassName, mergedClassNames?.root, cssVarCls, rootCls, treeSelectRootCls, hashId);
  const mergedSwitcherIcon = customSwitcherIcon ?? switcherIcon;
  const renderSwitcherIcon = nodeProps => (/*#__PURE__*/React.createElement(_iconUtil.default, {
    prefixCls: treePrefixCls,
    switcherIcon: mergedSwitcherIcon,
    treeNodeProps: nodeProps,
    showLine: treeLine
  }));
  // ============================ zIndex ============================
  const [zIndex] = (0, _hooks.useZIndex)('SelectLike', mergedStyles.popup?.root?.zIndex);
  return /*#__PURE__*/React.createElement(_treeSelect.default, {
    classNames: mergedClassNames,
    styles: mergedStyles,
    virtual: virtual,
    disabled: mergedDisabled,
    ...selectProps,
    popupMatchSelectWidth: mergedPopupMatchSelectWidth,
    builtinPlacements: (0, _mergedBuiltinPlacements.default)(builtinPlacements, popupOverflow),
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
    choiceTransitionName: (0, _motion.getTransitionName)(rootPrefixCls, '', choiceTransitionName),
    transitionName: (0, _motion.getTransitionName)(rootPrefixCls, 'slide-up', transitionName),
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
const PurePanel = (0, _PurePanel.default)(TreeSelect, 'popupAlign', props => (0, _util.omit)(props, ['visible']));
TreeSelect.TreeNode = _treeSelect.TreeNode;
TreeSelect.SHOW_ALL = _treeSelect.SHOW_ALL;
TreeSelect.SHOW_PARENT = _treeSelect.SHOW_PARENT;
TreeSelect.SHOW_CHILD = _treeSelect.SHOW_CHILD;
TreeSelect._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  TreeSelect.displayName = 'TreeSelect';
}
var _default = exports.default = TreeSelect;