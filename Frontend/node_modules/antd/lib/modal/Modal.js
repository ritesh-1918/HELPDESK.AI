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
var _dialog = _interopRequireDefault(require("@rc-component/dialog"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _hooks = require("../_util/hooks");
var _motion = require("../_util/motion");
var _styleChecker = require("../_util/styleChecker");
var _warning = require("../_util/warning");
var _zindexContext = _interopRequireDefault(require("../_util/zindexContext"));
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useFocusable = _interopRequireDefault(require("../drawer/useFocusable"));
var _skeleton = _interopRequireDefault(require("../skeleton"));
var _context2 = require("../watermark/context");
var _shared = require("./shared");
var _style = _interopRequireDefault(require("./style"));
let mousePosition;
// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = e => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY
  };
  // 100ms 内发生过点击事件，则从点击位置动画展示
  // 否则直接 zoom 展示
  // 这样可以兼容非点击方式展开
  setTimeout(() => {
    mousePosition = null;
  }, 100);
};
// 只有点击事件支持从鼠标位置动画展开
if ((0, _styleChecker.canUseDocElement)()) {
  document.documentElement.addEventListener('click', getClickPosition, true);
}
const Modal = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    open,
    wrapClassName,
    centered,
    getContainer,
    style,
    width = 520,
    footer,
    classNames,
    styles,
    children,
    loading,
    confirmLoading,
    zIndex: customizeZIndex,
    mousePosition: customizeMousePosition,
    onOk,
    onCancel,
    okButtonProps,
    cancelButtonProps,
    destroyOnHidden,
    destroyOnClose,
    panelRef = null,
    closable,
    mask: modalMask,
    modalRender,
    maskClosable,
    // Focusable
    focusTriggerAfterClose,
    focusable,
    ...restProps
  } = props;
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    centered: contextCentered,
    cancelButtonProps: contextCancelButtonProps,
    okButtonProps: contextOkButtonProps,
    mask: contextMask
  } = (0, _context.useComponentConfig)('modal');
  const {
    modal: modalContext
  } = React.useContext(_configProvider.ConfigContext);
  const [closableAfterClose, onClose] = React.useMemo(() => {
    if (typeof closable === 'boolean') {
      return [undefined, undefined];
    }
    return [closable?.afterClose, closable?.onClose];
  }, [closable]);
  const prefixCls = getPrefixCls('modal', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  // ============================ Mask ============================
  const [mergedMask, maskBlurClassName, mergeMaskClosable] = (0, _hooks.useMergedMask)(modalMask, contextMask, prefixCls, maskClosable);
  // ========================== Focusable =========================
  const mergedFocusable = (0, _useFocusable.default)(focusable, mergedMask, focusTriggerAfterClose);
  // ============================ Open ============================
  const handleCancel = e => {
    if (confirmLoading) {
      return;
    }
    onCancel?.(e);
    onClose?.();
  };
  const handleOk = e => {
    onOk?.(e);
    onClose?.();
  };
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Modal');
    [['bodyStyle', 'styles.body'], ['maskStyle', 'styles.mask'], ['destroyOnClose', 'destroyOnHidden'], ['autoFocusButton', 'focusable.autoFocusButton'], ['focusTriggerAfterClose', 'focusable.focusTriggerAfterClose'], ['maskClosable', 'mask.closable']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  // Style
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const wrapClassNameExtended = (0, _clsx.clsx)(wrapClassName, {
    [`${prefixCls}-centered`]: centered ?? contextCentered,
    [`${prefixCls}-wrap-rtl`]: direction === 'rtl'
  });
  const dialogFooter = footer !== null && !loading ? (/*#__PURE__*/React.createElement(_shared.Footer, {
    ...props,
    okButtonProps: {
      ...contextOkButtonProps,
      ...okButtonProps
    },
    onOk: handleOk,
    cancelButtonProps: {
      ...contextCancelButtonProps,
      ...cancelButtonProps
    },
    onCancel: handleCancel
  })) : null;
  const [rawClosable, mergedCloseIcon, closeBtnIsDisabled, ariaProps] = (0, _hooks.useClosable)((0, _hooks.pickClosable)(props), (0, _hooks.pickClosable)(modalContext), {
    closable: true,
    closeIcon: /*#__PURE__*/React.createElement(_CloseOutlined.default, {
      className: `${prefixCls}-close-icon`
    }),
    closeIconRender: icon => (0, _shared.renderCloseIcon)(prefixCls, icon)
  });
  const mergedClosable = rawClosable ? {
    disabled: closeBtnIsDisabled,
    closeIcon: mergedCloseIcon,
    afterClose: closableAfterClose,
    ...ariaProps
  } : false;
  // ============================ modalRender ============================
  const mergedModalRender = modalRender ? node => /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-render`
  }, modalRender(node)) : undefined;
  // ============================ Refs ============================
  // Select `ant-modal-container` by `panelRef`
  const panelClassName = `.${prefixCls}-${modalRender ? 'render' : 'container'}`;
  const innerPanelRef = (0, _context2.usePanelRef)(panelClassName);
  const mergedPanelRef = (0, _ref.composeRef)(panelRef, innerPanelRef);
  // ============================ zIndex ============================
  const [zIndex, contextZIndex] = (0, _hooks.useZIndex)('Modal', customizeZIndex);
  const mergedProps = {
    ...props,
    width,
    panelRef,
    focusTriggerAfterClose: mergedFocusable.focusTriggerAfterClose,
    focusable: mergedFocusable,
    mask: mergedMask,
    maskClosable: mergeMaskClosable,
    zIndex
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames, maskBlurClassName], [contextStyles, styles], {
    props: mergedProps
  });
  // =========================== Width ============================
  const [numWidth, responsiveWidth] = React.useMemo(() => {
    if (width && typeof width === 'object') {
      return [undefined, width];
    }
    return [width, undefined];
  }, [width]);
  const responsiveWidthVars = React.useMemo(() => {
    const vars = {};
    if (responsiveWidth) {
      Object.keys(responsiveWidth).forEach(breakpoint => {
        const breakpointWidth = responsiveWidth[breakpoint];
        if (breakpointWidth !== undefined) {
          vars[`--${prefixCls}-${breakpoint}-width`] = typeof breakpointWidth === 'number' ? `${breakpointWidth}px` : breakpointWidth;
        }
      });
    }
    return vars;
  }, [prefixCls, responsiveWidth]);
  // =========================== Render ===========================
  return /*#__PURE__*/React.createElement(_ContextIsolator.default, {
    form: true,
    space: true
  }, /*#__PURE__*/React.createElement(_zindexContext.default.Provider, {
    value: contextZIndex
  }, /*#__PURE__*/React.createElement(_dialog.default, {
    width: numWidth,
    ...restProps,
    zIndex: zIndex,
    getContainer: getContainer === undefined ? getContextPopupContainer : getContainer,
    prefixCls: prefixCls,
    rootClassName: (0, _clsx.clsx)(hashId, rootClassName, cssVarCls, rootCls, mergedClassNames.root),
    rootStyle: mergedStyles.root,
    footer: dialogFooter,
    visible: open,
    mousePosition: customizeMousePosition ?? mousePosition,
    onClose: handleCancel,
    closable: mergedClosable,
    closeIcon: mergedCloseIcon,
    transitionName: (0, _motion.getTransitionName)(rootPrefixCls, 'zoom', props.transitionName),
    maskTransitionName: (0, _motion.getTransitionName)(rootPrefixCls, 'fade', props.maskTransitionName),
    mask: mergedMask,
    maskClosable: mergeMaskClosable,
    className: (0, _clsx.clsx)(hashId, className, contextClassName),
    style: {
      ...contextStyle,
      ...style,
      ...responsiveWidthVars
    },
    classNames: {
      ...mergedClassNames,
      wrapper: (0, _clsx.clsx)(mergedClassNames.wrapper, wrapClassNameExtended)
    },
    styles: mergedStyles,
    panelRef: mergedPanelRef,
    destroyOnHidden: destroyOnHidden ?? destroyOnClose,
    modalRender: mergedModalRender,
    // Focusable
    focusTriggerAfterClose: mergedFocusable.focusTriggerAfterClose,
    focusTrap: mergedFocusable.trap
  }, loading ? (/*#__PURE__*/React.createElement(_skeleton.default, {
    active: true,
    title: false,
    paragraph: {
      rows: 4
    },
    className: `${prefixCls}-body-skeleton`
  })) : children)));
};
var _default = exports.default = Modal;