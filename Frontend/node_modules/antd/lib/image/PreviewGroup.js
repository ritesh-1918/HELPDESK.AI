"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.icons = exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _CloseOutlined = _interopRequireDefault(require("@ant-design/icons/CloseOutlined"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _RotateLeftOutlined = _interopRequireDefault(require("@ant-design/icons/RotateLeftOutlined"));
var _RotateRightOutlined = _interopRequireDefault(require("@ant-design/icons/RotateRightOutlined"));
var _SwapOutlined = _interopRequireDefault(require("@ant-design/icons/SwapOutlined"));
var _ZoomInOutlined = _interopRequireDefault(require("@ant-design/icons/ZoomInOutlined"));
var _ZoomOutOutlined = _interopRequireDefault(require("@ant-design/icons/ZoomOutOutlined"));
var _image = _interopRequireDefault(require("@rc-component/image"));
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _context = require("../config-provider/context");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _useMergedPreviewConfig = _interopRequireDefault(require("./hooks/useMergedPreviewConfig"));
var _usePreviewConfig = _interopRequireDefault(require("./hooks/usePreviewConfig"));
var _style = _interopRequireDefault(require("./style"));
const icons = exports.icons = {
  rotateLeft: /*#__PURE__*/React.createElement(_RotateLeftOutlined.default, null),
  rotateRight: /*#__PURE__*/React.createElement(_RotateRightOutlined.default, null),
  zoomIn: /*#__PURE__*/React.createElement(_ZoomInOutlined.default, null),
  zoomOut: /*#__PURE__*/React.createElement(_ZoomOutOutlined.default, null),
  close: /*#__PURE__*/React.createElement(_CloseOutlined.default, null),
  left: /*#__PURE__*/React.createElement(_LeftOutlined.default, null),
  right: /*#__PURE__*/React.createElement(_RightOutlined.default, null),
  flipX: /*#__PURE__*/React.createElement(_SwapOutlined.default, null),
  flipY: /*#__PURE__*/React.createElement(_SwapOutlined.default, {
    rotate: 90
  })
};
const InternalPreviewGroup = ({
  previewPrefixCls: customizePrefixCls,
  preview,
  classNames,
  styles,
  ...otherProps
}) => {
  // =============================== MISC ===============================
  // Context
  const {
    getPrefixCls,
    getPopupContainer: getContextPopupContainer,
    direction,
    preview: contextPreview,
    classNames: contextClassNames,
    styles: contextStyles
  } = (0, _context.useComponentConfig)('image');
  const prefixCls = getPrefixCls('image', customizePrefixCls);
  const previewPrefixCls = `${prefixCls}-preview`;
  // ============================== Style ===============================
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const mergedRootClassName = (0, _clsx.clsx)(hashId, cssVarCls, rootCls);
  // ============================= Preview ==============================
  const [previewConfig, previewRootClassName, previewMaskClassName] = (0, _usePreviewConfig.default)(preview);
  const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = (0, _usePreviewConfig.default)(contextPreview);
  // ============================ Semantics =============================
  const memoizedIcons = React.useMemo(() => ({
    ...icons,
    left: direction === 'rtl' ? /*#__PURE__*/React.createElement(_RightOutlined.default, null) : /*#__PURE__*/React.createElement(_LeftOutlined.default, null),
    right: direction === 'rtl' ? /*#__PURE__*/React.createElement(_LeftOutlined.default, null) : /*#__PURE__*/React.createElement(_RightOutlined.default, null)
  }), [direction]);
  const mergedPreview = (0, _useMergedPreviewConfig.default)(
  // Preview config
  previewConfig, contextPreviewConfig,
  // MISC
  prefixCls, mergedRootClassName, getContextPopupContainer, icons);
  const {
    mask: mergedMask,
    blurClassName
  } = mergedPreview ?? {};
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...otherProps,
    classNames,
    styles
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([contextClassNames, classNames, {
    cover: (0, _clsx.clsx)(contextPreviewMaskClassName, previewMaskClassName),
    popup: {
      root: (0, _clsx.clsx)(contextPreviewRootClassName, previewRootClassName),
      mask: (0, _clsx.clsx)({
        [`${prefixCls}-preview-mask-hidden`]: !mergedMask
      }, blurClassName)
    }
  }], [contextStyles, styles], {
    props: mergedProps
  }, {
    popup: {
      _default: 'root'
    }
  });
  return /*#__PURE__*/React.createElement(_image.default.PreviewGroup, {
    preview: mergedPreview,
    previewPrefixCls: previewPrefixCls,
    icons: memoizedIcons,
    ...otherProps,
    classNames: mergedClassNames,
    styles: mergedStyles
  });
};
var _default = exports.default = InternalPreviewGroup;