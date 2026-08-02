function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import useControlledState from "@rc-component/util/es/hooks/useControlledState";
import useEvent from "@rc-component/util/es/hooks/useEvent";
import * as React from 'react';
import { useState } from 'react';
import Preview from "./Preview";
import { PreviewGroupContext } from "./context";
import usePreviewItems from "./hooks/usePreviewItems";
const Group = ({
  previewPrefixCls = 'rc-image-preview',
  classNames,
  styles,
  children,
  icons = {},
  items,
  preview,
  fallback
}) => {
  const {
    open: previewOpen,
    onOpenChange,
    current: currentIndex,
    onChange,
    ...restProps
  } = preview && typeof preview === 'object' ? preview : {};

  // ========================== Items ===========================
  const [mergedItems, register, fromItems] = usePreviewItems(items);

  // ========================= Preview ==========================
  // >>> Index
  const [current, setCurrent] = useControlledState(0, currentIndex);
  const [keepOpenIndex, setKeepOpenIndex] = useState(false);

  // >>> Image
  const {
    src,
    ...imgCommonProps
  } = mergedItems[current]?.data || {};
  // >>> Visible
  const [isShowPreview, setShowPreview] = useControlledState(!!previewOpen, previewOpen);
  const triggerShowPreview = useEvent(next => {
    setShowPreview(next);
    if (next !== isShowPreview) {
      onOpenChange?.(next, {
        current
      });
    }
  });

  // >>> Position
  const [mousePosition, setMousePosition] = useState(null);
  const onPreviewFromImage = React.useCallback((id, imageSrc, mouseX, mouseY) => {
    const index = fromItems ? mergedItems.findIndex(item => item.data.src === imageSrc) : mergedItems.findIndex(item => item.id === id);
    setCurrent(index < 0 ? 0 : index);
    triggerShowPreview(true);
    setMousePosition({
      x: mouseX,
      y: mouseY
    });
    setKeepOpenIndex(true);
  }, [mergedItems, fromItems]);

  // Reset current when reopen
  React.useEffect(() => {
    if (isShowPreview) {
      if (!keepOpenIndex) {
        setCurrent(0);
      }
    } else {
      setKeepOpenIndex(false);
    }
  }, [isShowPreview]);

  // ========================== Events ==========================
  const onInternalChange = (next, prev) => {
    setCurrent(next);
    onChange?.(next, prev);
  };
  const onPreviewClose = () => {
    triggerShowPreview(false);
    setMousePosition(null);
  };

  // ========================= Context ==========================
  const previewGroupContext = React.useMemo(() => ({
    register,
    onPreview: onPreviewFromImage
  }), [register, onPreviewFromImage]);

  // ========================== Render ==========================
  return /*#__PURE__*/React.createElement(PreviewGroupContext.Provider, {
    value: previewGroupContext
  }, children, /*#__PURE__*/React.createElement(Preview, _extends({
    "aria-hidden": !isShowPreview,
    open: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    imgCommonProps: imgCommonProps,
    src: src,
    fallback: fallback,
    icons: icons,
    current: current,
    count: mergedItems.length,
    onChange: onInternalChange
  }, restProps, {
    classNames: classNames?.popup,
    styles: styles?.popup
  })));
};
export default Group;