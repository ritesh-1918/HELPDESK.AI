"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _warning = require("../_util/warning");
var _wave = _interopRequireDefault(require("../_util/wave"));
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useSize = _interopRequireDefault(require("../config-provider/hooks/useSize"));
var _Compact = require("../space/Compact");
var _ButtonGroup = _interopRequireWildcard(require("./ButtonGroup"));
var _buttonHelpers = require("./buttonHelpers");
var _DefaultLoadingIcon = _interopRequireDefault(require("./DefaultLoadingIcon"));
var _IconWrapper = _interopRequireDefault(require("./IconWrapper"));
var _style = _interopRequireDefault(require("./style"));
var _compact = _interopRequireDefault(require("./style/compact"));
function getLoadingConfig(loading) {
  if (typeof loading === 'object' && loading) {
    let delay = loading?.delay;
    delay = !Number.isNaN(delay) && typeof delay === 'number' ? delay : 0;
    return {
      loading: delay <= 0,
      delay
    };
  }
  return {
    loading: !!loading,
    delay: 0
  };
}
const ButtonTypeMap = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  // `link` is not a real color but we should compatible with it
  link: ['link', 'link'],
  text: ['default', 'text']
};
const InternalCompoundedButton = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    _skipSemantic,
    loading = false,
    prefixCls: customizePrefixCls,
    color,
    variant,
    type,
    danger = false,
    shape: customizeShape,
    size: customizeSize,
    disabled: customDisabled,
    className,
    rootClassName,
    children,
    icon,
    iconPosition,
    iconPlacement,
    ghost = false,
    block = false,
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button',
    classNames,
    styles,
    style,
    autoInsertSpace,
    autoFocus,
    ...rest
  } = props;
  const childNodes = (0, _util.toArray)(children);
  // https://github.com/ant-design/ant-design/issues/47605
  // Compatible with original `type` behavior
  const mergedType = type || 'default';
  const {
    getPrefixCls,
    direction,
    autoInsertSpace: contextAutoInsertSpace,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    loadingIcon: contextLoadingIcon,
    shape: contextShape,
    color: contextColor,
    variant: contextVariant
  } = (0, _context.useComponentConfig)('button');
  const mergedShape = customizeShape || contextShape || 'default';
  const [parsedColor, parsedVariant] = (0, _react.useMemo)(() => {
    // >>>>> Local
    // Color & Variant
    if (color && variant) {
      return [color, variant];
    }
    // Sugar syntax
    if (type || danger) {
      const colorVariantPair = ButtonTypeMap[mergedType] || [];
      if (danger) {
        return ['danger', colorVariantPair[1]];
      }
      return colorVariantPair;
    }
    // >>> Context fallback
    if (contextColor && contextVariant) {
      return [contextColor, contextVariant];
    }
    return ['default', 'outlined'];
  }, [color, variant, type, danger, contextColor, contextVariant, mergedType]);
  const [mergedColor, mergedVariant] = (0, _react.useMemo)(() => {
    if (ghost && parsedVariant === 'solid') {
      return [parsedColor, 'outlined'];
    }
    return [parsedColor, parsedVariant];
  }, [parsedColor, parsedVariant, ghost]);
  const isDanger = mergedColor === 'danger';
  const mergedColorText = isDanger ? 'dangerous' : mergedColor;
  const mergedInsertSpace = autoInsertSpace ?? contextAutoInsertSpace ?? true;
  const prefixCls = getPrefixCls('btn', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const disabled = (0, _react.useContext)(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  const groupSize = (0, _react.useContext)(_ButtonGroup.GroupSizeContext);
  const loadingOrDelay = (0, _react.useMemo)(() => getLoadingConfig(loading), [loading]);
  const [innerLoading, setLoading] = (0, _react.useState)(loadingOrDelay.loading);
  const [hasTwoCNChar, setHasTwoCNChar] = (0, _react.useState)(false);
  const buttonRef = (0, _react.useRef)(null);
  const mergedRef = (0, _util.useComposeRef)(ref, buttonRef);
  const needInserted = childNodes.length === 1 && !icon && !(0, _buttonHelpers.isUnBorderedButtonVariant)(mergedVariant);
  // ========================= Mount ==========================
  // Record for mount status.
  // This will help to no to show the animation of loading on the first mount.
  const isMountRef = (0, _react.useRef)(true);
  _react.default.useEffect(() => {
    isMountRef.current = false;
    return () => {
      isMountRef.current = true;
    };
  }, []);
  // ========================= Effect =========================
  // Loading. Should use `useLayoutEffect` to avoid low perf multiple click issue.
  // https://github.com/ant-design/ant-design/issues/51325
  (0, _useLayoutEffect.default)(() => {
    let delayTimer = null;
    if (loadingOrDelay.delay > 0) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        setLoading(true);
      }, loadingOrDelay.delay);
    } else {
      setLoading(loadingOrDelay.loading);
    }
    function cleanupTimer() {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }
    return cleanupTimer;
  }, [loadingOrDelay.delay, loadingOrDelay.loading]);
  // Two chinese characters check
  (0, _react.useEffect)(() => {
    // FIXME: for HOC usage like <FormatMessage />
    if (!buttonRef.current || !mergedInsertSpace) {
      return;
    }
    const buttonText = buttonRef.current.textContent || '';
    if (needInserted && (0, _buttonHelpers.isTwoCNChar)(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  });
  // Auto focus
  (0, _react.useEffect)(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, []);
  // ========================= Events =========================
  const handleClick = _react.default.useCallback(e => {
    // FIXME: https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    props.onClick?.('href' in props ? e : e);
  }, [props.onClick, innerLoading, mergedDisabled]);
  // ========================== Warn ==========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Button');
    process.env.NODE_ENV !== "production" ? warning(!(typeof icon === 'string' && icon.length > 2), 'breaking', `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`) : void 0;
    process.env.NODE_ENV !== "production" ? warning(!(ghost && (0, _buttonHelpers.isUnBorderedButtonVariant)(mergedVariant)), 'usage', "`link` or `text` button can't be a `ghost` button.") : void 0;
    warning.deprecated(!iconPosition, 'iconPosition', 'iconPlacement');
  }
  // ========================== Size ==========================
  const {
    compactSize,
    compactItemClassnames
  } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
  const sizeClassNameMap = {
    large: 'lg',
    small: 'sm',
    middle: undefined,
    medium: undefined
  };
  const sizeFullName = (0, _useSize.default)(ctxSize => customizeSize ?? compactSize ?? groupSize ?? ctxSize);
  const sizeCls = sizeFullName ? sizeClassNameMap[sizeFullName] ?? '' : '';
  const iconType = innerLoading ? 'loading' : icon;
  const mergedIconPlacement = iconPlacement ?? iconPosition ?? 'start';
  const linkButtonRestProps = (0, _util.omit)(rest, ['navigate']);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    type: mergedType,
    color: mergedColor,
    variant: mergedVariant,
    danger: isDanger,
    shape: mergedShape,
    size: sizeFullName,
    disabled: mergedDisabled,
    loading: innerLoading,
    iconPlacement: mergedIconPlacement
  };
  // ========================= Style ==========================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([_skipSemantic ? undefined : contextClassNames, classNames], [_skipSemantic ? undefined : contextStyles, styles], {
    props: mergedProps
  });
  // ========================= Render =========================
  const classes = (0, _clsx.clsx)(prefixCls, hashId, cssVarCls, {
    [`${prefixCls}-${mergedShape}`]: mergedShape !== 'default' && mergedShape !== 'square' && mergedShape,
    // Compatible with versions earlier than 5.21.0
    [`${prefixCls}-${mergedType}`]: mergedType,
    [`${prefixCls}-dangerous`]: danger,
    [`${prefixCls}-color-${mergedColorText}`]: mergedColorText,
    [`${prefixCls}-variant-${mergedVariant}`]: mergedVariant,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
    [`${prefixCls}-background-ghost`]: ghost && !(0, _buttonHelpers.isUnBorderedButtonVariant)(mergedVariant),
    [`${prefixCls}-loading`]: innerLoading,
    [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && mergedInsertSpace && !innerLoading,
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-icon-end`]: mergedIconPlacement === 'end'
  }, compactItemClassnames, className, rootClassName, contextClassName, mergedClassNames.root);
  const fullStyle = {
    ...mergedStyles.root,
    ...contextStyle,
    ...style
  };
  const iconSharedProps = {
    className: mergedClassNames.icon,
    style: mergedStyles.icon
  };
  /**
   * Extract icon node
   * If there is a custom icon and not in loading state: show custom icon
   */
  const iconWrapperElement = child => (/*#__PURE__*/_react.default.createElement(_IconWrapper.default, {
    prefixCls: prefixCls,
    ...iconSharedProps
  }, child));
  const defaultLoadingIconElement = /*#__PURE__*/_react.default.createElement(_DefaultLoadingIcon.default, {
    existIcon: !!icon,
    prefixCls: prefixCls,
    loading: innerLoading,
    mount: isMountRef.current,
    ...iconSharedProps
  });
  const mergedLoadingIcon = loading && typeof loading === 'object' ? loading.icon || contextLoadingIcon : contextLoadingIcon;
  /**
   * Using if-else statements can improve code readability without affecting future expansion.
   */
  let iconNode;
  if (icon && !innerLoading) {
    iconNode = iconWrapperElement(icon);
  } else if (loading && mergedLoadingIcon) {
    iconNode = iconWrapperElement(mergedLoadingIcon);
  } else {
    iconNode = defaultLoadingIconElement;
  }
  const contentNode = (0, _isNonNullable.default)(children) ? (0, _buttonHelpers.spaceChildren)(children, needInserted && mergedInsertSpace, mergedStyles.content, mergedClassNames.content) : null;
  if (linkButtonRestProps.href !== undefined) {
    return /*#__PURE__*/_react.default.createElement("a", {
      ...linkButtonRestProps,
      className: (0, _clsx.clsx)(classes, {
        [`${prefixCls}-disabled`]: mergedDisabled
      }),
      href: mergedDisabled ? undefined : linkButtonRestProps.href,
      style: fullStyle,
      onClick: handleClick,
      ref: mergedRef,
      tabIndex: mergedDisabled ? -1 : 0,
      "aria-disabled": mergedDisabled
    }, iconNode, contentNode);
  }
  let buttonNode = /*#__PURE__*/_react.default.createElement("button", {
    ...rest,
    type: htmlType,
    className: classes,
    style: fullStyle,
    onClick: handleClick,
    disabled: mergedDisabled,
    ref: mergedRef
  }, iconNode, contentNode, compactItemClassnames && /*#__PURE__*/_react.default.createElement(_compact.default, {
    prefixCls: prefixCls
  }));
  if (!(0, _buttonHelpers.isUnBorderedButtonVariant)(mergedVariant)) {
    buttonNode = /*#__PURE__*/_react.default.createElement(_wave.default, {
      component: "Button",
      disabled: innerLoading
    }, buttonNode);
  }
  return buttonNode;
});
const Button = InternalCompoundedButton;
Button.Group = _ButtonGroup.default;
Button.__ANT_BUTTON = true;
if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}
var _default = exports.default = Button;