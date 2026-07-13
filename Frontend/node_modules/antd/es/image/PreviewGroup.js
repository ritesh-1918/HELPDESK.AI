"use client";

import * as React from 'react';
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined";
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import RotateLeftOutlined from "@ant-design/icons/es/icons/RotateLeftOutlined";
import RotateRightOutlined from "@ant-design/icons/es/icons/RotateRightOutlined";
import SwapOutlined from "@ant-design/icons/es/icons/SwapOutlined";
import ZoomInOutlined from "@ant-design/icons/es/icons/ZoomInOutlined";
import ZoomOutOutlined from "@ant-design/icons/es/icons/ZoomOutOutlined";
import RcImage from '@rc-component/image';
import { clsx } from 'clsx';
import { useMergeSemantic } from '../_util/hooks';
import { useComponentConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import useMergedPreviewConfig from './hooks/useMergedPreviewConfig';
import usePreviewConfig from './hooks/usePreviewConfig';
import useStyle from './style';
export const icons = {
  rotateLeft: /*#__PURE__*/React.createElement(RotateLeftOutlined, null),
  rotateRight: /*#__PURE__*/React.createElement(RotateRightOutlined, null),
  zoomIn: /*#__PURE__*/React.createElement(ZoomInOutlined, null),
  zoomOut: /*#__PURE__*/React.createElement(ZoomOutOutlined, null),
  close: /*#__PURE__*/React.createElement(CloseOutlined, null),
  left: /*#__PURE__*/React.createElement(LeftOutlined, null),
  right: /*#__PURE__*/React.createElement(RightOutlined, null),
  flipX: /*#__PURE__*/React.createElement(SwapOutlined, null),
  flipY: /*#__PURE__*/React.createElement(SwapOutlined, {
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
  } = useComponentConfig('image');
  const prefixCls = getPrefixCls('image', customizePrefixCls);
  const previewPrefixCls = `${prefixCls}-preview`;
  // ============================== Style ===============================
  const rootCls = useCSSVarCls(prefixCls);
  const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
  const mergedRootClassName = clsx(hashId, cssVarCls, rootCls);
  // ============================= Preview ==============================
  const [previewConfig, previewRootClassName, previewMaskClassName] = usePreviewConfig(preview);
  const [contextPreviewConfig, contextPreviewRootClassName, contextPreviewMaskClassName] = usePreviewConfig(contextPreview);
  // ============================ Semantics =============================
  const memoizedIcons = React.useMemo(() => ({
    ...icons,
    left: direction === 'rtl' ? /*#__PURE__*/React.createElement(RightOutlined, null) : /*#__PURE__*/React.createElement(LeftOutlined, null),
    right: direction === 'rtl' ? /*#__PURE__*/React.createElement(LeftOutlined, null) : /*#__PURE__*/React.createElement(RightOutlined, null)
  }), [direction]);
  const mergedPreview = useMergedPreviewConfig(
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
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames, {
    cover: clsx(contextPreviewMaskClassName, previewMaskClassName),
    popup: {
      root: clsx(contextPreviewRootClassName, previewRootClassName),
      mask: clsx({
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
  return /*#__PURE__*/React.createElement(RcImage.PreviewGroup, {
    preview: mergedPreview,
    previewPrefixCls: previewPrefixCls,
    icons: memoizedIcons,
    ...otherProps,
    classNames: mergedClassNames,
    styles: mergedStyles
  });
};
export default InternalPreviewGroup;