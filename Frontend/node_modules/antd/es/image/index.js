"use client";

import * as React from 'react';
import RcImage from '@rc-component/image';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { devUseWarning } from '../_util/warning';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useMergedPreviewConfig from './hooks/useMergedPreviewConfig';
import usePreviewConfig from './hooks/usePreviewConfig';
import PreviewGroup, { icons } from './PreviewGroup';
import useStyle from './style';
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
  } = useComponentConfig('image');
  const prefixCls = getPrefixCls('image', customizePrefixCls);
  // ============================= Warning ==============================
  if (process.env.NODE_ENV !== 'production') {
    const warning = devUseWarning('Image');
    warning.deprecated(!wrapperStyle, 'wrapperStyle', 'styles.root');
  }
  // ============================== Styles ==============================
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const mergedRootClassName = clsx(rootClassName, hashId, cssVarCls, rootCls);
  const mergedClassName = clsx(className, hashId, contextClassName);
  // ============================= Preview ==============================
  const [previewConfig, previewRootClassName, previewMaskClassName] = usePreviewConfig(preview);
  const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = usePreviewConfig(contextPreview);
  const mergedPreviewConfig = useMergedPreviewConfig(
  // Preview config
  previewConfig, contextPreviewConfig,
  // MISC
  prefixCls, mergedRootClassName, getContextPopupContainer, icons, true);
  // =========== Merged Props for Semantic ===========
  const mergedProps = {
    ...props,
    preview: mergedPreviewConfig
  };
  // ============================= Semantic =============================
  const mergedLegacyClassNames = React.useMemo(() => ({
    cover: clsx(contextPreviewMaskClassName, previewMaskClassName),
    popup: {
      root: clsx(contextPreviewRootClassName, previewRootClassName)
    }
  }), [previewRootClassName, previewMaskClassName, contextPreviewRootClassName, contextPreviewMaskClassName]);
  const {
    mask: mergedMask,
    blurClassName
  } = mergedPreviewConfig ?? {};
  const mergedPopupClassNames = React.useMemo(() => ({
    mask: clsx({
      [`${prefixCls}-preview-mask-hidden`]: !mergedMask
    }, blurClassName)
  }), [mergedMask, prefixCls, blurClassName]);
  const internalClassNames = React.useMemo(() => [contextClassNames, classNames, mergedLegacyClassNames, {
    popup: mergedPopupClassNames
  }], [contextClassNames, classNames, mergedLegacyClassNames, mergedPopupClassNames]);
  const [mergedClassNames, mergedStyles] = useMergeSemantic(internalClassNames, [contextStyles, {
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
  return /*#__PURE__*/React.createElement(RcImage, {
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
Image.PreviewGroup = PreviewGroup;
if (process.env.NODE_ENV !== 'production') {
  Image.displayName = 'Image';
}
export default Image;