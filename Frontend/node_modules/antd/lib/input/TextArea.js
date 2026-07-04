"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _textarea = _interopRequireDefault(require("@rc-component/textarea"));
var _clsx = require("clsx");
var _getAllowClear = _interopRequireDefault(require("../_util/getAllowClear"));
var _hooks = require("../_util/hooks");
var _statusUtils = require("../_util/statusUtils");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _context2 = require("../form/context");
var _useVariants = _interopRequireDefault(require("../form/hooks/useVariants"));
var _Compact = require("../space/Compact");
var _Input = require("./Input");
var _style = require("./style");
var _textarea2 = _interopRequireDefault(require("./style/textarea"));
const TextArea = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    size: customizeSize,
    disabled: customDisabled,
    status: customStatus,
    allowClear,
    classNames,
    rootClassName,
    className,
    style,
    styles,
    variant: customVariant,
    showCount,
    onMouseDown,
    onResize,
    ...rest
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const {
      deprecated
    } = (0, _warning.devUseWarning)('TextArea');
    deprecated(!('bordered' in props), 'bordered', 'variant');
  }
  const {
    getPrefixCls,
    direction,
    allowClear: contextAllowClear,
    autoComplete: contextAutoComplete,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('textArea');
  // =================== Disabled ===================
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  // ==================== Status ====================
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = React.useContext(_context2.FormItemInputContext);
  const mergedStatus = (0, _statusUtils.getMergedStatus)(contextStatus, customStatus);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props
  });
  // ===================== Ref ======================
  const innerRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    resizableTextArea: innerRef.current?.resizableTextArea,
    focus: option => {
      (0, _Input.triggerFocus)(innerRef.current?.resizableTextArea?.textArea, option);
    },
    blur: () => innerRef.current?.blur(),
    nativeElement: innerRef.current?.nativeElement || null
  }));
  const prefixCls = getPrefixCls('input', customizePrefixCls);
  // ==================== Style =====================
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.useSharedStyle)(prefixCls, rootClassName);
  (0, _textarea2.default)(prefixCls, rootCls);
  // ================= Compact Item =================
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  // ===================== Size =====================
  const mergedSize = (0, _useSize.default)(ctx => customizeSize ?? compactSize ?? ctx);
  const [variant, enableVariantCls] = (0, _useVariants.default)('textArea', customVariant, bordered);
  const mergedAllowClear = (0, _getAllowClear.default)(allowClear ?? contextAllowClear);
  // ==================== Resize ====================
  // https://github.com/ant-design/ant-design/issues/51594
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  // When has wrapper, resize will make as dirty for `resize: both` style
  const [resizeDirty, setResizeDirty] = React.useState(false);
  const onInternalMouseDown = e => {
    setIsMouseDown(true);
    onMouseDown?.(e);
    const onMouseUp = () => {
      setIsMouseDown(false);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mouseup', onMouseUp);
  };
  const onInternalResize = size => {
    onResize?.(size);
    // Change to dirty since this maybe from the `resize: both` style
    if (isMouseDown && typeof getComputedStyle === 'function') {
      const ele = innerRef.current?.nativeElement?.querySelector('textarea');
      if (ele && getComputedStyle(ele).resize === 'both') {
        setResizeDirty(true);
      }
    }
  };
  // ==================== Render ====================
  return /*#__PURE__*/React.createElement(_textarea.default, {
    autoComplete: contextAutoComplete,
    ...rest,
    style: {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    },
    styles: mergedStyles,
    disabled: mergedDisabled,
    allowClear: mergedAllowClear,
    className: (0, _clsx.clsx)(cssVarCls, rootCls, className, rootClassName, compactItemClassnames, contextClassName, mergedClassNames.root,
    // Only for wrapper
    {
      [`${prefixCls}-textarea-affix-wrapper-resize-dirty`]: resizeDirty
    }),
    classNames: {
      ...mergedClassNames,
      textarea: (0, _clsx.clsx)({
        [`${prefixCls}-sm`]: mergedSize === 'small',
        [`${prefixCls}-lg`]: mergedSize === 'large'
      }, hashId, mergedClassNames.textarea, isMouseDown && `${prefixCls}-mouse-active`),
      variant: (0, _clsx.clsx)({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, (0, _statusUtils.getStatusClassNames)(prefixCls, mergedStatus)),
      affixWrapper: (0, _clsx.clsx)(`${prefixCls}-textarea-affix-wrapper`, {
        [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === 'large',
        [`${prefixCls}-textarea-show-count`]: showCount || props.count?.show
      }, hashId)
    },
    prefixCls: prefixCls,
    suffix: hasFeedback && /*#__PURE__*/React.createElement("span", {
      className: `${prefixCls}-textarea-suffix`
    }, feedbackIcon),
    showCount: showCount,
    ref: innerRef,
    onResize: onInternalResize,
    onMouseDown: onInternalMouseDown
  });
});
var _default = exports.default = TextArea;