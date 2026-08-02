"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _image = _interopRequireDefault(require("@rc-component/image"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _warning = require("../_util/warning");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useMergedPreviewConfig = _interopRequireDefault(require("./hooks/useMergedPreviewConfig"));
var _usePreviewConfig = _interopRequireDefault(require("./hooks/usePreviewConfig"));
var _PreviewGroup = _interopRequireWildcard(require("./PreviewGroup"));
var _style = _interopRequireDefault(require("./style"));
const Image = props => {
  const {
    prefixCls: customizePrefixCls,
    preview,
    className,
    rootClassName,
    style,
    styles,
    classNames,
    wrapperStyle,
    fallback,
    ...otherProps
  } = props;
  // =============================== MISC ===============================
  // Context
  const {
    getPrefixCls,
    getPopupContainer: getContextPopupContainer,
    className: contextClassName,
    style: contextStyle,
    preview: contextPreview,
    styles: contextStyles,
    classNames: contextClassNames,
    fallback: contextFallback
  } = (0, _context.useComponentConfig)('image');
  const prefixCls = getPrefixCls('image', customizePrefixCls);
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Image');
    warning.deprecated(!wrapperStyle, 'wrapperStyle', 'styles.root');
  }
  // ============================== Styles ==============================
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const mergedRootClassName = (0, _clsx.clsx)(rootClassName, hashId, cssVarCls, rootCls);
  const mergedClassName = (0, _clsx.clsx)(className, hashId, contextClassName);
  // ============================= Preview ==============================
  const [previewConfig, previewRootClassName, previewMaskClassName] = (0, _usePreviewConfig.default)(preview);
  const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = (0, _usePreviewConfig.default)(contextPreview);
  const mergedPreviewConfig = (0, _useMergedPreviewConfig.default)(
  // Preview config
  previewConfig, contextPreviewConfig,
  // MISC
  prefixCls, mergedRootClassName, getContextPopupContainer, _PreviewGroup.icons, true);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    preview: mergedPreviewConfig
  };
  // ============================= Semantic =============================
  const mergedLegacyClassNames = React.useMemo(() => ({
    cover: (0, _clsx.clsx)(contextPreviewMaskClassName, previewMaskClassName),
    popup: {
      root: (0, _clsx.clsx)(contextPreviewRootClassName, previewRootClassName)
    }
  }), [previewRootClassName, previewMaskClassName, contextPreviewRootClassName, contextPreviewMaskClassName]);
  const {
    mask: mergedMask,
    blurClassName
  } = mergedPreviewConfig ?? {};
  const mergedPopupClassNames = React.useMemo(() => ({
    mask: (0, _clsx.clsx)({
      [`${prefixCls}-preview-mask-hidden`]: !mergedMask
    }, blurClassName)
  }), [mergedMask, prefixCls, blurClassName]);
  const internalClassNames = React.useMemo(() => [contextClassNames, classNames, mergedLegacyClassNames, {
    popup: mergedPopupClassNames
  }], [contextClassNames, classNames, mergedLegacyClassNames, mergedPopupClassNames]);
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)(internalClassNames, [contextStyles, {
    root: wrapperStyle
  }, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  const mergedStyle = {
    ...contextStyle,
    ...style
  };
  const mergedFallback = fallback ?? contextFallback;
  // ============================== Render ==============================
  return /*#__PURE__*/React.createElement(_image.default, {
    prefixCls: prefixCls,
    preview: mergedPreviewConfig || false,
    rootClassName: mergedRootClassName,
    className: mergedClassName,
    style: mergedStyle,
    fallback: mergedFallback,
    ...otherProps,
    classNames: mergedClassNames,
    styles: mergedStyles
  });
};
Image.PreviewGroup = _PreviewGroup.default;
if (process.env.NODE_ENV !== 'production') {
  Image.displayName = 'Image';
}
var _default = exports.default = Image;