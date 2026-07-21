"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _cascader = require("@rc-component/cascader");
var _clsx = require("clsx");
var _context = require("../config-provider/context");
var _defaultRenderEmpty = _interopRequireDefault(require("../config-provider/defaultRenderEmpty"));
var _DisabledContext = _interopRequireDefault(require("../config-provider/DisabledContext"));
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useBase = _interopRequireDefault(require("./hooks/useBase"));
var _useCheckable = _interopRequireDefault(require("./hooks/useCheckable"));
var _style = _interopRequireDefault(require("./style"));
var _panel = _interopRequireDefault(require("./style/panel"));
var _useIcons = _interopRequireDefault(require("./hooks/useIcons"));
function CascaderPanel(props) {
  const {
    prefixCls: customizePrefixCls,
    className,
    multiple,
    rootClassName,
    notFoundContent,
    direction,
    expandIcon,
    loadingIcon,
    disabled: customDisabled
  } = props;
  const {
    expandIcon: contextExpandIcon,
    loadingIcon: contextLoadingIcon
  } = (0, _context.useComponentConfig)('cascader');
  const disabled = React.useContext(_DisabledContext.default);
  const mergedDisabled = customDisabled ?? disabled;
  const [_, cascaderPrefixCls, mergedDirection, renderEmpty] = (0, _useBase.default)(customizePrefixCls, direction);
  const rootCls = (0, _useCSSVarCls.default)(cascaderPrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(cascaderPrefixCls, rootCls);
  (0, _panel.default)(cascaderPrefixCls);
  const isRtl = mergedDirection === 'rtl';
  // ===================== Icon ======================
  const {
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon
  } = (0, _useIcons.default)({
    contextExpandIcon,
    contextLoadingIcon,
    expandIcon,
    loadingIcon,
    isRtl
  });
  // ===================== Empty =====================
  const mergedNotFoundContent = notFoundContent || renderEmpty?.('Cascader') || (/*#__PURE__*/React.createElement(_defaultRenderEmpty.default, {
    componentName: "Cascader"
  }));
  // =================== Multiple ====================
  const checkable = (0, _useCheckable.default)(cascaderPrefixCls, multiple);
  // ==================== Render =====================
  return /*#__PURE__*/React.createElement(_cascader.Panel, {
    ...props,
    checkable: checkable,
    prefixCls: cascaderPrefixCls,
    className: (0, _clsx.clsx)(className, hashId, rootClassName, cssVarCls, rootCls),
    notFoundContent: mergedNotFoundContent,
    direction: mergedDirection,
    expandIcon: mergedExpandIcon,
    loadingIcon: mergedLoadingIcon,
    disabled: mergedDisabled
  });
}
var _default = exports.default = CascaderPanel;