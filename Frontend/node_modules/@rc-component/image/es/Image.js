function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import { clsx } from 'clsx';
import * as React from 'react';
import { useContext, useMemo, useState } from 'react';
import Preview from "./Preview";
import PreviewGroup from "./PreviewGroup";
import { COMMON_PROPS } from "./common";
import { PreviewGroupContext } from "./context";
import useRegisterImage from "./hooks/useRegisterImage";
import useStatus from "./hooks/useStatus";
const ImageInternal = props => {
  const {
    // Misc
    prefixCls = 'rc-image',
    previewPrefixCls = `${prefixCls}-preview`,
    // Style
    rootClassName,
    className,
    style,
    classNames = {},
    styles = {},
    width,
    height,
    // Image
    src: imgSrc,
    alt,
    placeholder,
    fallback,
    // Preview
    preview = true,
    // Events
    onClick,
    onError,
    ...otherProps
  } = props;
  const groupContext = useContext(PreviewGroupContext);

  // ========================== Preview ===========================
  const canPreview = !!preview;
  const {
    src: previewSrc,
    open: previewOpen,
    onOpenChange: onPreviewOpenChange,
    cover,
    rootClassName: previewRootClassName,
    ...restProps
  } = preview && typeof preview === 'object' ? preview : {};
  const coverPlacement = typeof cover === 'object' && cover.placement ? cover.placement || 'center' : 'center';
  const coverNode = typeof cover === 'object' && cover.coverNode ? cover.coverNode : cover;

  // ============================ Open ============================
  const [isShowPreview, setShowPreview] = useControlledState(!!previewOpen, previewOpen);
  const [mousePosition, setMousePosition] = useState(null);
  const triggerPreviewOpen = nextOpen => {
    setShowPreview(nextOpen);
    onPreviewOpenChange?.(nextOpen);
  };
  const onPreviewClose = () => {
    triggerPreviewOpen(false);
  };

  // ========================= ImageProps =========================
  const isCustomPlaceholder = placeholder && placeholder !== true;
  const src = previewSrc ?? imgSrc;
  const [getImgRef, srcAndOnload, status] = useStatus({
    src: imgSrc,
    isCustomPlaceholder,
    fallback
  });
  const imgCommonProps = useMemo(() => {
    const obj = {};
    COMMON_PROPS.forEach(prop => {
      if (props[prop] !== undefined) {
        obj[prop] = props[prop];
      }
    });
    return obj;
  }, COMMON_PROPS.map(prop => props[prop]));

  // ========================== Register ==========================
  const registerData = useMemo(() => ({
    ...imgCommonProps,
    src
  }), [src, imgCommonProps]);
  const imageId = useRegisterImage(canPreview, registerData);

  // ========================== Preview ===========================
  const onPreview = e => {
    const rect = e.target.getBoundingClientRect();
    const left = rect.x + rect.width / 2;
    const top = rect.y + rect.height / 2;
    if (groupContext) {
      groupContext.onPreview(imageId, src, left, top);
    } else {
      setMousePosition({
        x: left,
        y: top
      });
      triggerPreviewOpen(true);
    }
    onClick?.(e);
  };

  // =========================== Render ===========================
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", _extends({}, otherProps, {
    className: clsx(prefixCls, rootClassName, classNames.root, {
      [`${prefixCls}-error`]: status === 'error'
    }),
    onClick: canPreview ? onPreview : onClick,
    style: {
      width,
      height,
      ...styles.root
    }
  }), /*#__PURE__*/React.createElement("img", _extends({}, imgCommonProps, {
    className: clsx(`${prefixCls}-img`, {
      [`${prefixCls}-img-placeholder`]: placeholder === true
    }, classNames.image, className),
    style: {
      height,
      ...styles.image,
      ...style
    },
    ref: getImgRef
  }, srcAndOnload, {
    width: width,
    height: height,
    onError: onError
  })), status === 'loading' && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: `${prefixCls}-placeholder`
  }, placeholder), cover !== false && canPreview && /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-cover`, classNames.cover, `${prefixCls}-cover-${coverPlacement}`),
    style: {
      display: style?.display === 'none' ? 'none' : undefined,
      ...styles.cover
    }
  }, coverNode)), !groupContext && canPreview && /*#__PURE__*/React.createElement(Preview, _extends({
    "aria-hidden": !isShowPreview,
    open: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    src: src,
    alt: alt,
    imageInfo: {
      width,
      height
    },
    fallback: fallback,
    imgCommonProps: imgCommonProps
  }, restProps, {
    classNames: classNames?.popup,
    styles: styles?.popup,
    rootClassName: clsx(previewRootClassName, rootClassName)
  })));
};
ImageInternal.PreviewGroup = PreviewGroup;
if (process.env.NODE_ENV !== 'production') {
  ImageInternal.displayName = 'Image';
}
export default ImageInternal;