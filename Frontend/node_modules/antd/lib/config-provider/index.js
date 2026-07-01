"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ConfigConsumer", {
  enumerable: true,
  get: function () {
    return _context3.ConfigConsumer;
  }
});
Object.defineProperty(exports, "ConfigContext", {
  enumerable: true,
  get: function () {
    return _context3.ConfigContext;
  }
});
Object.defineProperty(exports, "Variants", {
  enumerable: true,
  get: function () {
    return _context3.Variants;
  }
});
exports.default = exports.configConsumerProps = void 0;
Object.defineProperty(exports, "defaultIconPrefixCls", {
  enumerable: true,
  get: function () {
    return _context3.defaultIconPrefixCls;
  }
});
Object.defineProperty(exports, "defaultPrefixCls", {
  enumerable: true,
  get: function () {
    return _context3.defaultPrefixCls;
  }
});
exports.warnContext = exports.globalConfig = void 0;
var React = _interopRequireWildcard(require("react"));
var _cssinjs = require("@ant-design/cssinjs");
var _Context = _interopRequireDefault(require("@ant-design/icons/lib/components/Context"));
var _util = require("@rc-component/util");
var _useMemo = _interopRequireDefault(require("@rc-component/util/lib/hooks/useMemo"));
var _warning = _interopRequireWildcard(require("../_util/warning"));
var _validateMessagesContext = _interopRequireDefault(require("../form/validateMessagesContext"));
var _locale = _interopRequireWildcard(require("../locale"));
var _context = _interopRequireDefault(require("../locale/context"));
var _en_US = _interopRequireDefault(require("../locale/en_US"));
var _context2 = require("../theme/context");
var _seed = _interopRequireDefault(require("../theme/themes/seed"));
var _UniqueProvider = _interopRequireDefault(require("../tooltip/UniqueProvider"));
var _context3 = require("./context");
var _DisabledContext = require("./DisabledContext");
var _useConfig = _interopRequireDefault(require("./hooks/useConfig"));
var _useTheme = _interopRequireDefault(require("./hooks/useTheme"));
var _MotionWrapper = _interopRequireDefault(require("./MotionWrapper"));
var _PropWarning = _interopRequireDefault(require("./PropWarning"));
var _SizeContext = _interopRequireWildcard(require("./SizeContext"));
var _style = _interopRequireDefault(require("./style"));
/**
 * This component registers icon styles inside the DesignTokenContext.Provider
 * so that CSS variables use the correct cssVar key from the theme config.
 */
const IconStyle = ({
  iconPrefixCls,
  csp
}) => {
  (0, _style.default)(iconPrefixCls, csp);
  return null;
};
/**
 * Since too many feedback using static method like `Modal.confirm` not getting theme, we record the
 * theme register info here to help developer get warning info.
 */
let existThemeConfig = false;
const warnContext = exports.warnContext = process.env.NODE_ENV !== 'production' ? componentName => {
  process.env.NODE_ENV !== "production" ? (0, _warning.default)(!existThemeConfig, componentName, `Static function can not consume context like dynamic theme. Please use 'App' component instead.`) : void 0;
} : /* istanbul ignore next */
null;
const configConsumerProps = exports.configConsumerProps = ['getTargetContainer', 'getPopupContainer', 'rootPrefixCls', 'getPrefixCls', 'renderEmpty', 'csp', 'autoInsertSpaceInButton', 'locale'];
// These props is used by `useContext` directly in sub component
const PASSED_PROPS = ['getTargetContainer', 'getPopupContainer', 'renderEmpty', 'input', 'pagination', 'form', 'select', 'button'];
let globalPrefixCls;
let globalIconPrefixCls;
let globalTheme;
let globalHolderRender;
function getGlobalPrefixCls() {
  return globalPrefixCls || _context3.defaultPrefixCls;
}
function getGlobalIconPrefixCls() {
  return globalIconPrefixCls || _context3.defaultIconPrefixCls;
}
const setGlobalConfig = props => {
  const {
    prefixCls,
    iconPrefixCls,
    theme,
    holderRender
  } = props;
  if (prefixCls !== undefined) {
    globalPrefixCls = prefixCls;
  }
  if (iconPrefixCls !== undefined) {
    globalIconPrefixCls = iconPrefixCls;
  }
  if ('holderRender' in props) {
    globalHolderRender = holderRender;
  }
  if (theme) {
    globalTheme = theme;
  }
};
const globalConfig = () => ({
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
  },
  getIconPrefixCls: getGlobalIconPrefixCls,
  getRootPrefixCls: () => {
    // If Global prefixCls provided, use this
    if (globalPrefixCls) {
      return globalPrefixCls;
    }
    // Fallback to default prefixCls
    return getGlobalPrefixCls();
  },
  getTheme: () => globalTheme,
  holderRender: globalHolderRender
});
exports.globalConfig = globalConfig;
const ProviderChildren = props => {
  const {
    children,
    csp: customCsp,
    autoInsertSpaceInButton,
    alert,
    affix,
    anchor,
    app,
    form,
    locale,
    componentSize,
    direction,
    space,
    splitter,
    virtual,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    popupOverflow,
    legacyLocale,
    parentContext,
    iconPrefixCls: customIconPrefixCls,
    theme,
    componentDisabled,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    masonry,
    menu,
    pagination,
    input,
    textArea,
    otp,
    empty,
    badge,
    radio,
    rate,
    ribbon,
    switch: SWITCH,
    transfer,
    avatar,
    message,
    tag,
    table,
    card,
    cardMeta,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    qrcode,
    floatButton,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect,
    watermark
  } = props;
  // =================================== Context ===================================
  const getPrefixCls = React.useCallback((suffixCls, customizePrefixCls) => {
    const {
      prefixCls
    } = props;
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    const mergedPrefixCls = prefixCls || parentContext.getPrefixCls('');
    return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
  }, [parentContext.getPrefixCls, props.prefixCls]);
  const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || _context3.defaultIconPrefixCls;
  const csp = customCsp || parentContext.csp;
  const mergedTheme = (0, _useTheme.default)(theme, parentContext.theme, {
    prefixCls: getPrefixCls('')
  });
  if (process.env.NODE_ENV !== 'production') {
    existThemeConfig = existThemeConfig || !!mergedTheme;
  }
  const baseConfig = {
    csp,
    autoInsertSpaceInButton,
    alert,
    affix,
    anchor,
    app,
    locale: locale || legacyLocale,
    direction,
    space,
    splitter,
    virtual,
    popupMatchSelectWidth: popupMatchSelectWidth ?? dropdownMatchSelectWidth,
    popupOverflow,
    getPrefixCls,
    iconPrefixCls,
    theme: mergedTheme,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    input,
    textArea,
    otp,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    masonry,
    menu,
    pagination,
    empty,
    badge,
    radio,
    rate,
    ribbon,
    switch: SWITCH,
    transfer,
    avatar,
    message,
    tag,
    table,
    card,
    cardMeta,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    qrcode,
    floatButton,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect,
    watermark
  };
  if (process.env.NODE_ENV !== 'production') {
    const warningFn = (0, _warning.devUseWarning)('ConfigProvider');
    warningFn(!('autoInsertSpaceInButton' in props), 'deprecated', '`autoInsertSpaceInButton` is deprecated. Please use `{ button: { autoInsertSpace: boolean }}` instead.');
  }
  const config = {
    ...parentContext
  };
  Object.keys(baseConfig).forEach(key => {
    if (baseConfig[key] !== undefined) {
      config[key] = baseConfig[key];
    }
  });
  // Pass the props used by `useContext` directly with child component.
  // These props should merged into `config`.
  PASSED_PROPS.forEach(propName => {
    const propValue = props[propName];
    if (propValue) {
      config[propName] = propValue;
    }
  });
  if (typeof autoInsertSpaceInButton !== 'undefined') {
    // merge deprecated api
    config.button = {
      autoInsertSpace: autoInsertSpaceInButton,
      ...config.button
    };
  }
  // https://github.com/ant-design/ant-design/issues/27617
  const memoedConfig = (0, _useMemo.default)(() => config, config, (prevConfig, currentConfig) => {
    const prevKeys = Object.keys(prevConfig);
    const currentKeys = Object.keys(currentConfig);
    return prevKeys.length !== currentKeys.length || prevKeys.some(key => prevConfig[key] !== currentConfig[key]);
  });
  const {
    layer
  } = React.useContext(_cssinjs.StyleContext);
  const memoIconContextValue = React.useMemo(() => ({
    prefixCls: iconPrefixCls,
    csp,
    layer: layer ? 'antd' : undefined
  }), [iconPrefixCls, csp, layer]);
  let childNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconStyle, {
    iconPrefixCls: iconPrefixCls,
    csp: csp
  }), /*#__PURE__*/React.createElement(_PropWarning.default, {
    dropdownMatchSelectWidth: dropdownMatchSelectWidth
  }), children);
  const validateMessages = React.useMemo(() => (0, _util.merge)(_en_US.default.Form?.defaultValidateMessages || {}, memoedConfig.locale?.Form?.defaultValidateMessages || {}, memoedConfig.form?.validateMessages || {}, form?.validateMessages || {}), [memoedConfig, form?.validateMessages]);
  if (Object.keys(validateMessages).length > 0) {
    childNode = /*#__PURE__*/React.createElement(_validateMessagesContext.default.Provider, {
      value: validateMessages
    }, childNode);
  }
  if (locale) {
    childNode = /*#__PURE__*/React.createElement(_locale.default, {
      locale: locale,
      _ANT_MARK__: _locale.ANT_MARK
    }, childNode);
  }
  if (iconPrefixCls || csp) {
    childNode = /*#__PURE__*/React.createElement(_Context.default.Provider, {
      value: memoIconContextValue
    }, childNode);
  }
  if (componentSize) {
    childNode = /*#__PURE__*/React.createElement(_SizeContext.SizeContextProvider, {
      size: componentSize
    }, childNode);
  }
  // =================================== Motion ===================================
  childNode = /*#__PURE__*/React.createElement(_MotionWrapper.default, null, childNode);
  // ================================ Tooltip Unique ===============================
  if (tooltip?.unique) {
    childNode = /*#__PURE__*/React.createElement(_UniqueProvider.default, null, childNode);
  }
  // ================================ Dynamic theme ================================
  const memoTheme = React.useMemo(() => {
    const {
      algorithm,
      token,
      components,
      cssVar,
      ...rest
    } = mergedTheme || {};
    const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? (0, _cssinjs.createTheme)(algorithm) : _context2.defaultTheme;
    const parsedComponents = {};
    Object.entries(components || {}).forEach(([componentName, componentToken]) => {
      const parsedToken = {
        ...componentToken
      };
      if ('algorithm' in parsedToken) {
        if (parsedToken.algorithm === true) {
          parsedToken.theme = themeObj;
        } else if (Array.isArray(parsedToken.algorithm) || typeof parsedToken.algorithm === 'function') {
          parsedToken.theme = (0, _cssinjs.createTheme)(parsedToken.algorithm);
        }
        delete parsedToken.algorithm;
      }
      parsedComponents[componentName] = parsedToken;
    });
    const mergedToken = {
      ..._seed.default,
      ...token
    };
    return {
      ...rest,
      theme: themeObj,
      token: mergedToken,
      components: parsedComponents,
      override: {
        override: mergedToken,
        ...parsedComponents
      },
      cssVar
    };
  }, [mergedTheme]);
  if (theme) {
    childNode = /*#__PURE__*/React.createElement(_context2.DesignTokenContext.Provider, {
      value: memoTheme
    }, childNode);
  }
  // ================================== Warning ===================================
  if (memoedConfig.warning) {
    childNode = /*#__PURE__*/React.createElement(_warning.WarningContext.Provider, {
      value: memoedConfig.warning
    }, childNode);
  }
  // =================================== Render ===================================
  if (componentDisabled !== undefined) {
    childNode = /*#__PURE__*/React.createElement(_DisabledContext.DisabledContextProvider, {
      disabled: componentDisabled
    }, childNode);
  }
  return /*#__PURE__*/React.createElement(_context3.ConfigContext.Provider, {
    value: memoedConfig
  }, childNode);
};
const ConfigProvider = props => {
  const context = React.useContext(_context3.ConfigContext);
  const antLocale = React.useContext(_context.default);
  return /*#__PURE__*/React.createElement(ProviderChildren, {
    parentContext: context,
    legacyLocale: antLocale,
    ...props
  });
};
ConfigProvider.ConfigContext = _context3.ConfigContext;
ConfigProvider.SizeContext = _SizeContext.default;
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = _useConfig.default;
Object.defineProperty(ConfigProvider, 'SizeContext', {
  get: () => {
    process.env.NODE_ENV !== "production" ? (0, _warning.default)(false, 'ConfigProvider', 'ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.') : void 0;
    return _SizeContext.default;
  }
});
if (process.env.NODE_ENV !== 'production') {
  ConfigProvider.displayName = 'ConfigProvider';
}
var _default = exports.default = ConfigProvider;