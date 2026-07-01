"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _DoubleLeftOutlined = _interopRequireDefault(require("@ant-design/icons/DoubleLeftOutlined"));
var _DoubleRightOutlined = _interopRequireDefault(require("@ant-design/icons/DoubleRightOutlined"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _pagination = _interopRequireDefault(require("@rc-component/pagination"));
var _en_US = _interopRequireDefault(require("@rc-component/pagination/lib/locale/en_US"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _useBreakpoint = _interopRequireDefault(require("../grid/hooks/useBreakpoint"));
var _locale = require("../locale");
var _select = _interopRequireDefault(require("../select"));
var _internal = require("../theme/internal");
var _style = _interopRequireDefault(require("./style"));
var _bordered = _interopRequireDefault(require("./style/bordered"));
var _useShowSizeChanger = _interopRequireDefault(require("./useShowSizeChanger"));
const Pagination = props => {
  const {
    align,
    prefixCls: customizePrefixCls,
    selectPrefixCls: customizeSelectPrefixCls,
    className,
    rootClassName,
    style,
    size: customizeSize,
    locale: customLocale,
    responsive,
    showSizeChanger,
    selectComponentClass,
    pageSizeOptions,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    xs
  } = (0, _useBreakpoint.default)(responsive);
  const [, token] = (0, _internal.useToken)();
  const {
    getPrefixCls,
    direction,
    showSizeChanger: contextShowSizeChangerConfig,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    totalBoundaryShowSizeChanger: contextTotalBoundaryShowSizeChanger
  } = (0, _context.useComponentConfig)('pagination');
  const prefixCls = getPrefixCls('pagination', customizePrefixCls);
  // Style
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  // ============================== Size ==============================
  const mergedSize = (0, _useSize.default)(customizeSize);
  const isSmall = mergedSize === 'small' || !!(xs && !mergedSize && responsive);
  // =========== Merged Props for Semantic ==========
  const mergedProps = {
    ...props,
    size: mergedSize
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  // ============================= Locale =============================
  const [contextLocale] = (0, _locale.useLocale)('Pagination', _en_US.default);
  const locale = {
    ...contextLocale,
    ...customLocale
  };
  // ========================== Size Changer ==========================
  // Merge the props showSizeChanger
  const [propShowSizeChanger, propSizeChangerSelectProps] = (0, _useShowSizeChanger.default)(showSizeChanger);
  const [contextShowSizeChanger, contextSizeChangerSelectProps] = (0, _useShowSizeChanger.default)(contextShowSizeChangerConfig);
  const mergedShowSizeChanger = propShowSizeChanger ?? contextShowSizeChanger;
  const mergedShowSizeChangerSelectProps = propSizeChangerSelectProps ?? contextSizeChangerSelectProps;
  const SizeChanger = selectComponentClass || _select.default;
  // Generate options
  const mergedPageSizeOptions = React.useMemo(() => {
    return pageSizeOptions ? pageSizeOptions.map(option => Number(option)) : undefined;
  }, [pageSizeOptions]);
  // Render size changer
  const sizeChangerRender = info => {
    const {
      disabled,
      size: pageSize,
      onSizeChange,
      'aria-label': ariaLabel,
      className: sizeChangerClassName,
      options
    } = info;
    const {
      className: propSizeChangerClassName,
      onChange: propSizeChangerOnChange
    } = mergedShowSizeChangerSelectProps || {};
    // Origin Select is using Select.Option,
    // So it make the option value must be string
    // Just for compatible
    const selectedValue = options.find(option => String(option.value) === String(pageSize))?.value;
    return /*#__PURE__*/React.createElement(SizeChanger, {
      disabled: disabled,
      showSearch: true,
      popupMatchSelectWidth: false,
      getPopupContainer: triggerNode => triggerNode.parentNode,
      "aria-label": ariaLabel,
      options: options,
      ...mergedShowSizeChangerSelectProps,
      value: selectedValue,
      onChange: (nextSize, option) => {
        onSizeChange?.(nextSize);
        propSizeChangerOnChange?.(nextSize, option);
      },
      size: mergedSize,
      className: (0, _clsx.clsx)(sizeChangerClassName, propSizeChangerClassName)
    });
  };
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Pagination');
    process.env.NODE_ENV !== "production" ? warning(!selectComponentClass, 'usage', '`selectComponentClass` is not official api which will be removed.') : void 0;
  }
  // ============================= Render =============================
  const iconsProps = React.useMemo(() => {
    const ellipsis = /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-item-ellipsis`
    }, "\u2022\u2022\u2022");
    const prevIcon = /*#__PURE__*/React.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === 'rtl' ? /*#__PURE__*/React.createElement(_RightOutlined.default, null) : /*#__PURE__*/React.createElement(_LeftOutlined.default, null));
    const nextIcon = /*#__PURE__*/React.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === 'rtl' ? /*#__PURE__*/React.createElement(_LeftOutlined.default, null) : /*#__PURE__*/React.createElement(_RightOutlined.default, null));
    const jumpPrevIcon =
    /*#__PURE__*/
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    React.createElement("a", {
      className: `${prefixCls}-item-link`
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-item-container`
    }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(_DoubleRightOutlined.default, {
      className: `${prefixCls}-item-link-icon`
    })) : (/*#__PURE__*/React.createElement(_DoubleLeftOutlined.default, {
      className: `${prefixCls}-item-link-icon`
    })), ellipsis));
    const jumpNextIcon =
    /*#__PURE__*/
    // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
    React.createElement("a", {
      className: `${prefixCls}-item-link`
    }, /*#__PURE__*/React.createElement("div", {
      className: `${prefixCls}-item-container`
    }, direction === 'rtl' ? (/*#__PURE__*/React.createElement(_DoubleLeftOutlined.default, {
      className: `${prefixCls}-item-link-icon`
    })) : (/*#__PURE__*/React.createElement(_DoubleRightOutlined.default, {
      className: `${prefixCls}-item-link-icon`
    })), ellipsis));
    return {
      prevIcon,
      nextIcon,
      jumpPrevIcon,
      jumpNextIcon
    };
  }, [direction, prefixCls]);
  const selectPrefixCls = getPrefixCls('select', customizeSelectPrefixCls);
  const extendedClassName = (0, _clsx.clsx)({
    [`${prefixCls}-${align}`]: !!align,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    /** @deprecated Should be removed in v7 */
    [`${prefixCls}-mini`]: isSmall,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-bordered`]: token.wireframe
  }, contextClassName, className, rootClassName, mergedClassNames.root, hashId, cssVarCls);
  const mergedStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, token.wireframe && /*#__PURE__*/React.createElement(_bordered.default, {
    prefixCls: prefixCls
  }), /*#__PURE__*/React.createElement(_pagination.default, {
    ...iconsProps,
    ...restProps,
    styles: mergedStyles,
    classNames: mergedClassNames,
    style: mergedStyle,
    prefixCls: prefixCls,
    selectPrefixCls: selectPrefixCls,
    className: extendedClassName,
    locale: locale,
    pageSizeOptions: mergedPageSizeOptions,
    showSizeChanger: mergedShowSizeChanger,
    totalBoundaryShowSizeChanger: restProps.totalBoundaryShowSizeChanger ?? contextTotalBoundaryShowSizeChanger,
    sizeChangerRender: sizeChangerRender
  }));
};
if (process.env.NODE_ENV !== 'production') {
  Pagination.displayName = 'Pagination';
}
var _default = exports.default = Pagination;