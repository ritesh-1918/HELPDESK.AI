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
var _steps = require("@rc-component/steps");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _steps2 = _interopRequireDefault(require("../steps"));
var _context2 = require("../steps/context");
var _genStyleUtils = require("../theme/util/genStyleUtils");
var _style = _interopRequireDefault(require("./style"));
var _useItems = _interopRequireDefault(require("./useItems"));
const stepInternalContext = {
  rootComponent: 'ol',
  itemComponent: 'li'
};
const Timeline = props => {
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('timeline');
  const {
    prefixCls: customizePrefixCls,
    // Style
    className,
    style,
    classNames,
    styles,
    // Design
    variant = 'outlined',
    mode,
    orientation = 'vertical',
    titleSpan,
    // Data
    items,
    children,
    reverse,
    // Legacy Pending
    pending,
    pendingDot,
    ...restProps
  } = props;
  // ===================== MISC =======================
  const rootPrefixCls = getPrefixCls();
  const prefixCls = getPrefixCls('timeline', customizePrefixCls);
  // ==================== Styles ======================
  // This will be duplicated with Steps's hashId & cssVarCls when they have same token
  // But this is safe to keep here since web will do nothing
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const [varName] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'timeline');
  const stepsClassNames = React.useMemo(() => ({
    item: `${prefixCls}-item`,
    itemTitle: `${prefixCls}-item-title`,
    itemIcon: `${prefixCls}-item-icon`,
    itemContent: `${prefixCls}-item-content`,
    itemRail: `${prefixCls}-item-rail`,
    itemWrapper: `${prefixCls}-item-wrapper`,
    itemSection: `${prefixCls}-item-section`,
    itemHeader: `${prefixCls}-item-header`
  }), [prefixCls]);
  // ===================== Mode =======================
  const mergedMode = React.useMemo(() => {
    // Deprecated
    if (mode === 'left') {
      return 'start';
    }
    if (mode === 'right') {
      return 'end';
    }
    // Fill
    const modeList = ['alternate', 'start', 'end'];
    return modeList.includes(mode) ? mode : 'start';
  }, [mode]);
  // ===================== Data =======================
  const rawItems = (0, _useItems.default)(rootPrefixCls, prefixCls, mergedMode, items, children, pending, pendingDot);
  const mergedItems = React.useMemo(() => reverse ? (0, _toConsumableArray2.default)(rawItems).reverse() : rawItems, [reverse, rawItems]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    variant,
    mode: mergedMode,
    orientation,
    items: mergedItems
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([stepsClassNames, contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const stepContext = React.useMemo(() => ({
    railFollowPrevStatus: reverse
  }), [reverse]);
  // ==================== Design ======================
  const layoutAlternate = React.useMemo(() => mergedMode === 'alternate' || orientation === 'vertical' && mergedItems.some(item => item.title), [mergedItems, mergedMode, orientation]);
  // ===================== Warn =======================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Timeline');
    // Item
    warning.deprecated(!children, 'Timeline.Item', 'items');
    // Pending
    const pendingWarning = 'You can create a `item` as pending node directly.';
    warning.deprecated(!pending, 'pending', 'items', pendingWarning);
    warning.deprecated(!pendingDot, 'pendingDot', 'items', pendingWarning);
    // Mode
    warning.deprecated(mode !== 'left' && mode !== 'right', 'mode=left|right', 'mode=start|end');
    // Item Props
    const warnItems = items || [];
    [['label', 'title'], ['children', 'content'], ['dot', 'icon'], ['position', 'placement']].forEach(([oldProp, newProp]) => {
      warning.deprecated(warnItems.every(item => !item[oldProp]), `items.${oldProp}`, `items.${newProp}`);
    });
  }
  // ==================== Render ======================
  const stepStyle = {
    ...contextStyle,
    ...style
  };
  if ((0, _isNonNullable.default)(titleSpan) && mergedMode !== 'alternate') {
    if (typeof titleSpan === 'number' && !Number.isNaN(titleSpan)) {
      stepStyle[varName('head-span')] = titleSpan;
    } else {
      stepStyle[varName('head-span-ptg')] = titleSpan;
    }
  }
  return /*#__PURE__*/React.createElement(_context2.InternalContext.Provider, {
    value: stepInternalContext
  }, /*#__PURE__*/React.createElement(_steps.UnstableContext.Provider, {
    value: stepContext
  }, /*#__PURE__*/React.createElement(_steps2.default, {
    ...restProps,
    // Style
    className: (0, _clsx.clsx)(prefixCls, contextClassName, className, hashId, cssVarCls, {
      [`${prefixCls}-${orientation}`]: orientation === 'horizontal',
      [`${prefixCls}-layout-alternate`]: layoutAlternate,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    }),
    style: stepStyle,
    classNames: mergedClassNames,
    styles: mergedStyles,
    // Design
    variant: variant,
    orientation: orientation,
    // Layout
    type: "dot",
    items: mergedItems,
    current: mergedItems.length - 1
  })));
};
Timeline.Item = () => {};
if (process.env.NODE_ENV !== 'production') {
  Timeline.displayName = 'Timeline';
}
var _default = exports.default = Timeline;