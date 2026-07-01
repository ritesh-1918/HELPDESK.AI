"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _configProvider = require("../../config-provider");
var _en_US = _interopRequireDefault(require("../../locale/en_US"));
var _useLocale = _interopRequireDefault(require("../../locale/useLocale"));
var _ConfirmDialog = _interopRequireDefault(require("../ConfirmDialog"));
const HookModal = ({
  afterClose: hookAfterClose,
  config,
  ...restProps
}, ref) => {
  const [open, setOpen] = React.useState(true);
  const [innerConfig, setInnerConfig] = React.useState(config);
  const {
    direction,
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('modal');
  const rootPrefixCls = getPrefixCls();
  const afterClose = () => {
    hookAfterClose();
    innerConfig.afterClose?.();
  };
  const close = (...args) => {
    setOpen(false);
    const triggerCancel = args.some(param => param?.triggerCancel);
    if (triggerCancel) {
      innerConfig.onCancel?.(() => {}, ...args.slice(1));
    }
  };
  React.useImperativeHandle(ref, () => ({
    destroy: close,
    update: newConfig => {
      setInnerConfig(originConfig => {
        const nextConfig = typeof newConfig === 'function' ? newConfig(originConfig) : newConfig;
        return {
          ...originConfig,
          ...nextConfig
        };
      });
    }
  }));
  const mergedOkCancel = innerConfig.okCancel ?? innerConfig.type === 'confirm';
  const [contextLocale] = (0, _useLocale.default)('Modal', _en_US.default.Modal);
  return /*#__PURE__*/React.createElement(_ConfirmDialog.default, {
    prefixCls: prefixCls,
    rootPrefixCls: rootPrefixCls,
    ...innerConfig,
    close: close,
    open: open,
    afterClose: afterClose,
    okText: innerConfig.okText || (mergedOkCancel ? contextLocale?.okText : contextLocale?.justOkText),
    direction: innerConfig.direction || direction,
    cancelText: innerConfig.cancelText || contextLocale?.cancelText,
    ...restProps
  });
};
var _default = exports.default = /*#__PURE__*/React.forwardRef(HookModal);