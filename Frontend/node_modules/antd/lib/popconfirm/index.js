"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _ExclamationCircleFilled = _interopRequireDefault(require("@ant-design/icons/ExclamationCircleFilled"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _popover = _interopRequireDefault(require("../popover"));
var _useMergedArrow = _interopRequireDefault(require("../tooltip/hook/useMergedArrow"));
var _PurePanel = _interopRequireWildcard(require("./PurePanel"));
var _style = _interopRequireDefault(require("./style"));
const InternalPopconfirm = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    placement = 'top',
    trigger,
    okType = 'primary',
    icon = /*#__PURE__*/React.createElement(_ExclamationCircleFilled.default, null),
    children,
    overlayClassName,
    onOpenChange,
    overlayStyle,
    styles,
    arrow: popconfirmArrow,
    classNames,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    arrow: contextArrow,
    trigger: contextTrigger
  } = (0, _context.useComponentConfig)('popconfirm');
  const [open, setOpen] = (0, _util.useControlledState)(props.defaultOpen ?? false, props.open);
  const mergedArrow = (0, _useMergedArrow.default)(popconfirmArrow, contextArrow);
  const mergedTrigger = trigger || contextTrigger || 'click';
  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Popconfirm');
    process.env.NODE_ENV !== "production" ? warning(!onOpenChange || onOpenChange.length <= 1, 'usage', 'The second `onOpenChange` parameter is internal and unsupported. Please lock to a previous version if needed.') : void 0;
  }
  const settingOpen = value => {
    setOpen(value);
    onOpenChange?.(value);
  };
  const close = () => {
    settingOpen(false);
  };
  const onConfirm = e => props.onConfirm?.call(void 0, e);
  const onCancel = e => {
    settingOpen(false);
    props.onCancel?.call(void 0, e);
  };
  const onInternalOpenChange = value => {
    const {
      disabled = false
    } = props;
    if (disabled) {
      return;
    }
    settingOpen(value);
  };
  const prefixCls = getPrefixCls('popconfirm', customizePrefixCls);
  const mergedProps = {
    ...props,
    placement,
    trigger: mergedTrigger,
    okType,
    overlayStyle,
    styles,
    classNames
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const rootClassNames = (0, _clsx.clsx)(prefixCls, contextClassName, overlayClassName, mergedClassNames.root);
  (0, _style.default)(prefixCls);
  return /*#__PURE__*/React.createElement(_popover.default, {
    arrow: mergedArrow,
    ...(0, _util.omit)(restProps, ['title']),
    trigger: mergedTrigger,
    placement: placement,
    onOpenChange: onInternalOpenChange,
    open: open,
    ref: ref,
    classNames: {
      root: rootClassNames,
      container: mergedClassNames.container,
      arrow: mergedClassNames.arrow
    },
    styles: {
      root: {
        ...contextStyle,
        ...mergedStyles.root,
        ...overlayStyle
      },
      container: mergedStyles.container,
      arrow: mergedStyles.arrow
    },
    content: /*#__PURE__*/React.createElement(_PurePanel.Overlay, {
      okType: okType,
      icon: icon,
      ...props,
      prefixCls: prefixCls,
      close: close,
      onConfirm: onConfirm,
      onCancel: onCancel,
      classNames: mergedClassNames,
      styles: mergedStyles
    }),
    "data-popover-inject": true
  }, children);
});
const Popconfirm = InternalPopconfirm;
// We don't care debug panel
/* istanbul ignore next */
Popconfirm._InternalPanelDoNotUseOrYouWillBeFired = _PurePanel.default;
if (process.env.NODE_ENV !== 'production') {
  Popconfirm.displayName = 'Popconfirm';
}
var _default = exports.default = Popconfirm;