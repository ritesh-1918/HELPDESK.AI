"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _EllipsisOutlined = _interopRequireDefault(require("@ant-design/icons/EllipsisOutlined"));
var _PlusOutlined = _interopRequireDefault(require("@ant-design/icons/PlusOutlined"));
var _tabs = _interopRequireDefault(require("@rc-component/tabs"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _useAnimateConfig = _interopRequireDefault(require("./hooks/useAnimateConfig"));
var _useLegacyItems = _interopRequireDefault(require("./hooks/useLegacyItems"));
var _style = _interopRequireDefault(require("./style"));
var _TabPane = _interopRequireDefault(require("./TabPane"));
const InternalTabs = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    type,
    className,
    rootClassName,
    size: customSize,
    onEdit,
    hideAdd,
    centered,
    addIcon,
    removeIcon,
    moreIcon,
    more,
    popupClassName,
    children,
    items,
    animated,
    style,
    indicatorSize,
    indicator,
    classNames,
    styles,
    destroyInactiveTabPane,
    destroyOnHidden,
    tabPlacement,
    tabPosition,
    ...restProps
  } = props;
  const {
    prefixCls: customizePrefixCls
  } = restProps;
  const {
    getPrefixCls,
    direction,
    getPopupContainer,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('tabs');
  const {
    tabs
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('tabs', customizePrefixCls);
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const tabsRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    nativeElement: tabsRef.current
  }));
  let editable;
  if (type === 'editable-card') {
    editable = {
      onEdit: (editType, {
        key,
        event
      }) => {
        onEdit?.(editType === 'add' ? event : key, editType);
      },
      removeIcon: removeIcon ?? tabs?.removeIcon ?? /*#__PURE__*/React.createElement(_CloseOutlined.default, null),
      addIcon: (addIcon ?? tabs?.addIcon) || /*#__PURE__*/React.createElement(_PlusOutlined.default, null),
      showAdd: hideAdd !== true
    };
  }
  const rootPrefixCls = getPrefixCls();
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Tabs');
    [['popupClassName', 'classNames.popup'], ['tabPosition', 'tabPlacement']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    process.env.NODE_ENV !== "production" ? warning(!('onPrevClick' in props) && !('onNextClick' in props), 'breaking', '`onPrevClick` and `onNextClick` has been removed. Please use `onTabScroll` instead.') : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(indicatorSize || tabs?.indicatorSize), 'deprecated', '`indicatorSize` has been deprecated. Please use `indicator={{ size: ... }}` instead.') : void 0;
    warning.deprecated(!('destroyInactiveTabPane' in props || items?.some(item => 'destroyInactiveTabPane' in item)), 'destroyInactiveTabPane', 'destroyOnHidden');
  }
  const size = (0, _useSize.default)(customSize);
  const mergedItems = (0, _useLegacyItems.default)(items, children);
  const mergedAnimated = (0, _useAnimateConfig.default)(prefixCls, animated);
  const mergedIndicator = {
    align: indicator?.align ?? tabs?.indicator?.align,
    size: indicator?.size ?? indicatorSize ?? tabs?.indicator?.size ?? tabs?.indicatorSize
  };
  const mergedPlacement = React.useMemo(() => {
    const placement = tabPlacement ?? tabPosition ?? undefined;
    const isRTL = direction === 'rtl';
    switch (placement) {
      case 'start':
        return isRTL ? 'right' : 'left';
      case 'end':
        return isRTL ? 'left' : 'right';
      default:
        return placement;
    }
  }, [tabPlacement, tabPosition, direction]);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    size,
    tabPlacement: mergedPlacement,
    items: mergedItems
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  return /*#__PURE__*/React.createElement(_tabs.default, {
    ref: tabsRef,
    direction: direction,
    getPopupContainer: getPopupContainer,
    ...restProps,
    items: mergedItems,
    className: (0, _clsx.clsx)({
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-card`]: ['card', 'editable-card'].includes(type),
      [`${prefixCls}-editable-card`]: type === 'editable-card',
      [`${prefixCls}-centered`]: centered
    }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls, rootCls),
    classNames: {
      ...mergedClassNames,
      popup: (0, _clsx.clsx)(popupClassName, hashId, cssVarCls, rootCls, mergedClassNames.popup?.root)
    },
    styles: mergedStyles,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    editable: editable,
    more: {
      icon: tabs?.more?.icon ?? tabs?.moreIcon ?? moreIcon ?? /*#__PURE__*/React.createElement(_EllipsisOutlined.default, null),
      transitionName: `${rootPrefixCls}-slide-up`,
      ...more
    },
    prefixCls: prefixCls,
    animated: mergedAnimated,
    indicator: mergedIndicator,
    destroyOnHidden: destroyOnHidden ?? destroyInactiveTabPane,
    tabPosition: mergedPlacement
  });
});
const Tabs = InternalTabs;
Tabs.TabPane = _TabPane.default;
if (process.env.NODE_ENV !== 'production') {
  Tabs.displayName = 'Tabs';
}
var _default = exports.default = Tabs;