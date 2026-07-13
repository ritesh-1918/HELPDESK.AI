"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _wave = _interopRequireDefault(require("../_util/wave"));
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _CheckableTag = _interopRequireDefault(require("./CheckableTag"));
var _CheckableTagGroup = _interopRequireDefault(require("./CheckableTagGroup"));
var _useColor = _interopRequireDefault(require("./hooks/useColor"));
var _style = _interopRequireDefault(require("./style"));
var _presetCmp = _interopRequireDefault(require("./style/presetCmp"));
var _statusCmp = _interopRequireDefault(require("./style/statusCmp"));
const InternalTag = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    children,
    icon,
    color,
    variant: _variant,
    onClose,
    bordered,
    disabled: customDisabled,
    href,
    target,
    styles,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    variant: contextVariant,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('tag');
  // ===================== Warnings =====================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Tag');
    warning.deprecated(bordered !== false, 'bordered={false}', 'variant="filled"');
    warning.deprecated(!color?.endsWith('-inverse'), 'color="xxx-inverse"', 'variant="solid"');
  }
  // ====================== Colors ======================
  const [mergedVariant, mergedColor, isPreset, isStatus, customTagStyle] = (0, _useColor.default)(props, contextVariant);
  const isInternalColor = isPreset || isStatus;
  // ===================== Disabled =====================
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  const {
    tag: tagContext
  } = React.useContext(_configProvider.ConfigContext);
  const [visible, setVisible] = React.useState(true);
  const domProps = (0, _util.omit)(restProps, ['closeIcon', 'closable']);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    color: mergedColor,
    variant: mergedVariant,
    disabled: mergedDisabled,
    href,
    target,
    icon
  };
  // ====================== Styles ======================
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const tagStyle = React.useMemo(() => {
    let nextTagStyle = {
      ...mergedStyles.root,
      ...contextStyle,
      ...style
    };
    if (!mergedDisabled) {
      nextTagStyle = {
        ...customTagStyle,
        ...nextTagStyle
      };
    }
    return nextTagStyle;
  }, [mergedStyles.root, contextStyle, style, customTagStyle, mergedDisabled]);
  const prefixCls = getPrefixCls('tag', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const tagClassName = (0, _clsx.clsx)(prefixCls, contextClassName, mergedClassNames.root, `${prefixCls}-${mergedVariant}`, {
    [`${prefixCls}-${mergedColor}`]: isInternalColor,
    [`${prefixCls}-hidden`]: !visible,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-disabled`]: mergedDisabled
  }, className, rootClassName, hashId, cssVarCls);
  // ===================== Closable =====================
  const handleCloseClick = e => {
    if (mergedDisabled) {
      return;
    }
    e.stopPropagation();
    onClose?.(e);
    if (e.defaultPrevented) {
      return;
    }
    setVisible(false);
  };
  const [, mergedCloseIcon] = (0, _hooks.useClosable)((0, _hooks.pickClosable)(props), (0, _hooks.pickClosable)(tagContext), {
    closable: false,
    closeIconRender: iconNode => {
      const replacement = /*#__PURE__*/React.createElement("span", {
        className: `${prefixCls}-close-icon`,
        onClick: handleCloseClick
      }, iconNode);
      return (0, _reactNode.replaceElement)(iconNode, replacement, originProps => ({
        onClick: e => {
          originProps?.onClick?.(e);
          handleCloseClick(e);
        },
        className: (0, _clsx.clsx)(originProps?.className, `${prefixCls}-close-icon`)
      }));
    }
  });
  // ====================== Render ======================
  const isNeedWave = typeof restProps.onClick === 'function' || children && children.type === 'a';
  const iconNode = (0, _reactNode.cloneElement)(icon, {
    className: (0, _clsx.clsx)(/*#__PURE__*/React.isValidElement(icon) ? icon.props?.className : '', mergedClassNames.icon),
    style: mergedStyles.icon
  });
  const child = iconNode ? (/*#__PURE__*/React.createElement(React.Fragment, null, iconNode, children && (/*#__PURE__*/React.createElement("span", {
    className: mergedClassNames.content,
    style: mergedStyles.content
  }, children)))) : children;
  const TagWrapper = href ? 'a' : 'span';
  const tagNode = /*#__PURE__*/React.createElement(TagWrapper, {
    ...domProps,
    // @ts-expect-error
    ref: ref,
    className: tagClassName,
    style: tagStyle,
    href: mergedDisabled ? undefined : href,
    target: target,
    onClick: mergedDisabled ? undefined : domProps.onClick,
    ...(href && mergedDisabled ? {
      'aria-disabled': true
    } : {})
  }, child, mergedCloseIcon, isPreset && /*#__PURE__*/React.createElement(_presetCmp.default, {
    key: "preset",
    prefixCls: prefixCls
  }), isStatus && /*#__PURE__*/React.createElement(_statusCmp.default, {
    key: "status",
    prefixCls: prefixCls
  }));
  return isNeedWave ? /*#__PURE__*/React.createElement(_wave.default, {
    component: "Tag"
  }, tagNode) : tagNode;
});
const Tag = InternalTag;
if (process.env.NODE_ENV !== 'production') {
  Tag.displayName = 'Tag';
}
Tag.CheckableTag = _CheckableTag.default;
Tag.CheckableTagGroup = _CheckableTagGroup.default;
var _default = exports.default = Tag;