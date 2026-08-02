import React from 'react';
import { clsx } from 'clsx';
import { useMergedMask, useZIndex } from '../../_util/hooks';
import { getTransitionName } from '../../_util/motion';
const useMergedPreviewConfig = (previewConfig, contextPreviewConfig, prefixCls, mergedRootClassName, getContextPopupContainer, icons, defaultCover) => {
  const [zIndex] = useZIndex('ImagePreview', previewConfig?.zIndex);
  const [mergedPreviewMask, blurClassName] = useMergedMask(previewConfig?.mask, contextPreviewConfig?.mask, `${prefixCls}-preview`);
  return React.useMemo(() => {
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
      motionName: getTransitionName(`${prefixCls}-preview`, 'fade'),
      ...previewConfig,
      ...(defaultCover ? {
        cover: cover ?? defaultCover
      } : {}),
      icons,
      getContainer: getContainer ?? getContextPopupContainer,
      zIndex,
      closeIcon: closeIcon ?? contextCloseIcon,
      rootClassName: clsx(mergedRootClassName, previewRootClassName),
      mask: mergedPreviewMask,
      blurClassName: blurClassName.mask
    };
  }, [previewConfig, contextPreviewConfig, prefixCls, mergedRootClassName, getContextPopupContainer, defaultCover, icons, zIndex, mergedPreviewMask, blurClassName]);
};
export default useMergedPreviewConfig;