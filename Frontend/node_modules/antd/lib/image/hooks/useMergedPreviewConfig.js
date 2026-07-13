"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _hooks = require("../../_util/hooks");
var _motion = require("../../_util/motion");
const useMergedPreviewConfig = (previewConfig, contextPreviewConfig, prefixCls, mergedRootClassName, getContextPopupContainer, icons, defaultCover) => {
  const [zIndex] = (0, _hooks.useZIndex)('ImagePreview', previewConfig?.zIndex);
  const [mergedPreviewMask, blurClassName] = (0, _hooks.useMergedMask)(previewConfig?.mask, contextPreviewConfig?.mask, `${prefixCls}-preview`);
  return _react.default.useMemo(() => {
    if (!previewConfig) {
      return previewConfig;
    }
    const {
      cover,
      getContainer,
      closeIcon,
      rootClassName: previewRootClassName
    } = previewConfig;
    const {
      closeIcon: contextCloseIcon
    } = contextPreviewConfig ?? {};
    return {
      motionName: (0, _motion.getTransitionName)(`${prefixCls}-preview`, 'fade'),
      ...previewConfig,
      ...(defaultCover ? {
        cover: cover ?? defaultCover
      } : {}),
      icons,
      getContainer: getContainer ?? getContextPopupContainer,
      zIndex,
      closeIcon: closeIcon ?? contextCloseIcon,
      rootClassName: (0, _clsx.clsx)(mergedRootClassName, previewRootClassName),
      mask: mergedPreviewMask,
      blurClassName: blurClassName.mask
    };
  }, [previewConfig, contextPreviewConfig, prefixCls, mergedRootClassName, getContextPopupContainer, defaultCover, icons, zIndex, mergedPreviewMask, blurClassName]);
};
var _default = exports.default = useMergedPreviewConfig;