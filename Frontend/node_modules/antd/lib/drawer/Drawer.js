"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _drawer = _interopRequireDefault(require("@rc-component/drawer"));
var _useId = _interopRequireDefault(require("@rc-component/util/lib/hooks/useId"));
var _ref = require("@rc-component/util/lib/ref");
var _clsx = require("clsx");
var _ContextIsolator = _interopRequireDefault(require("../_util/ContextIsolator"));
var _hooks = require("../_util/hooks");
var _motion = require("../_util/motion");
var _warning = require("../_util/warning");
var _zindexContext = _interopRequireDefault(require("../_util/zindexContext"));
var _configProvider = require("../config-provider");
var _context = require("../config-provider/context");
var _context2 = require("../watermark/context");
var _DrawerPanel = _interopRequireDefault(require("./DrawerPanel"));
var _style = _interopRequireDefault(require("./style"));
var _useFocusable = _interopRequireDefault(require("./useFocusable"));
const _SizeTypes = ['default', 'large'];
const DEFAULT_PUSH_STATE = {
  distance: 180
};
const DEFAULT_SIZE = 378;
const MOTION_CONFIG = {
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
  motionDeadline: 500
};
const Drawer = props => {
  const {
    rootClassName,
    size,
    defaultSize = DEFAULT_SIZE,
    height,
    width,
    mask: drawerMask,
    push = DEFAULT_PUSH_STATE,
    open,
    afterOpenChange,
    onClose,
    prefixCls: customizePrefixCls,
    getContainer: customizeGetContainer,
    panelRef = null,
    style,
    className,
    resizable,
    'aria-labelledby': ariaLabelledby,
    // Focus
    focusable,
    // Deprecated
    maskClosable,
    maskStyle,
    drawerStyle,
    contentWrapperStyle,
    destroyOnClose,
    destroyOnHidden,
    ...rest
  } = props;
  const {
    placement
  } = rest;
  const id = (0, _useId.default)();
  const ariaId = rest.title ? id : undefined;
  const {
    getPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles,
    mask: contextMask
  } = (0, _context.useComponentConfig)('drawer');
  const prefixCls = getPrefixCls('drawer', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const getContainer =
  // 有可能为 false，所以不能直接判断
  customizeGetContainer === undefined && getPopupContainer ? () => getPopupContainer(document.body) : customizeGetContainer;
  // ============================ Size ============================
  const drawerSize = React.useMemo(() => {
    if (typeof size === 'number') {
      return size;
    }
    if (size === 'large') {
      return 736;
    }
    if (size === 'default') {
      return DEFAULT_SIZE;
    }
    if (typeof size === 'string') {
      if (/^\d+(\.\d+)?$/.test(size)) {
        return Number(size);
      }
      return size;
    }
    if (!placement || placement === 'left' || placement === 'right') {
      return width;
    }
    return height;
  }, [size, placement, width, height]);
  // =========================== Motion ===========================
  const maskMotion = {
    motionName: (0, _motion.getTransitionName)(prefixCls, 'mask-motion'),
    ...MOTION_CONFIG
  };
  const panelMotion = motionPlacement => ({
    motionName: (0, _motion.getTransitionName)(prefixCls, `panel-motion-${motionPlacement}`),
    ...MOTION_CONFIG
  });
  // ============================ Refs ============================
  // Select `ant-drawer-content` by `panelRef`
  const innerPanelRef = (0, _context2.usePanelRef)();
  const mergedPanelRef = (0, _ref.composeRef)(panelRef, innerPanelRef);
  // =========================== zIndex ===========================
  const [zIndex, contextZIndex] = (0, _hooks.useZIndex)('Drawer', rest.zIndex);
  // ============================ Mask ============================
  const [mergedMask, maskBlurClassName, mergedMaskClosable] = (0, _hooks.useMergedMask)(drawerMask, contextMask, prefixCls, maskClosable);
  // ========================== Focusable =========================
  const mergedFocusable = (0, _useFocusable.default)(focusable, getContainer !== false && mergedMask);
  // =========================== Render ===========================
  const {
    classNames,
    styles,
    rootStyle
  } = rest;
  const mergedProps = {
    ...props,
    zIndex,
    panelRef,
    mask: mergedMask,
    maskClosable: mergedMaskClosable,
    defaultSize,
    push,
    focusable: mergedFocusable
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames], [contextStyles, styles], {
    props: mergedProps
  });
  const drawerClassName = (0, _clsx.clsx)({
    'no-mask': !mergedMask,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, rootClassName, hashId, cssVarCls, mergedClassNames.root);
  // ========================== Warning ===========================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Drawer');
    [['headerStyle', 'styles.header'], ['bodyStyle', 'styles.body'], ['footerStyle', 'styles.footer'], ['contentWrapperStyle', 'styles.wrapper'], ['maskStyle', 'styles.mask'], ['drawerStyle', 'styles.section'], ['destroyInactivePanel', 'destroyOnHidden'], ['width', 'size'], ['height', 'size']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
    if (getContainer !== undefined && props.style?.position === 'absolute') {
      process.env.NODE_ENV !== "production" ? warning(false, 'breaking', '`style` is replaced by `rootStyle` in v5. Please check that `position: absolute` is necessary.') : void 0;
    }
    warning.deprecated(!(mergedClassNames?.content || mergedStyles?.content), 'classNames.content and styles.content', 'classNames.section and styles.section');
  }
  return /*#__PURE__*/React.createElement(_ContextIsolator.default, {
    form: true,
    space: true
  }, /*#__PURE__*/React.createElement(_zindexContext.default.Provider, {
    value: contextZIndex
  }, /*#__PURE__*/React.createElement(_drawer.default, {
    prefixCls: prefixCls,
    onClose: onClose,
    maskMotion: maskMotion,
    motion: panelMotion,
    ...rest,
    classNames: {
      mask: (0, _clsx.clsx)(mergedClassNames.mask, maskBlurClassName.mask),
      section: mergedClassNames.section,
      wrapper: mergedClassNames.wrapper,
      dragger: mergedClassNames.dragger
    },
    styles: {
      mask: {
        ...mergedStyles.mask,
        ...maskStyle
      },
      section: {
        ...mergedStyles.section,
        ...drawerStyle
      },
      wrapper: {
        ...mergedStyles.wrapper,
        ...contentWrapperStyle
      },
      dragger: mergedStyles.dragger
    },
    open: open,
    mask: mergedMask,
    maskClosable: mergedMaskClosable,
    push: push,
    size: drawerSize,
    defaultSize: defaultSize,
    style: {
      ...contextStyle,
      ...style
    },
    rootStyle: {
      ...rootStyle,
      ...mergedStyles.root
    },
    className: (0, _clsx.clsx)(contextClassName, className),
    rootClassName: drawerClassName,
    getContainer: getContainer,
    afterOpenChange: afterOpenChange,
    panelRef: mergedPanelRef,
    zIndex: zIndex,
    ...(resizable ? {
      resizable
    } : {}),
    "aria-labelledby": ariaLabelledby ?? ariaId,
    destroyOnHidden: destroyOnHidden ?? destroyOnClose,
    // Focusable
    focusTriggerAfterClose: mergedFocusable.focusTriggerAfterClose,
    focusTrap: mergedFocusable.trap
  }, /*#__PURE__*/React.createElement(_DrawerPanel.default, {
    prefixCls: prefixCls,
    size: size,
    ...rest,
    ariaId: ariaId,
    onClose: onClose
  }))));
};
/** @private Internal Component. Do not use in your production. */
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    style,
    className,
    placement = 'right',
    ...restProps
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('drawer', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const cls = (0, _clsx.clsx)(prefixCls, `${prefixCls}-pure`, `${prefixCls}-${placement}`, hashId, cssVarCls, className);
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: style
  }, /*#__PURE__*/React.createElement(_DrawerPanel.default, {
    prefixCls: prefixCls,
    ...restProps
  }));
};
Drawer._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;
if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}
var _default = exports.default = Drawer;