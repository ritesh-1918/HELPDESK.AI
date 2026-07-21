import { clsx } from 'clsx';
import * as React from 'react';
export default function Footer(props) {
  // 修改解构，添加缺失的属性，并提供默认值
  const {
    prefixCls,
    showProgress,
    current,
    count,
    showSwitch,
    // Style
    classNames,
    styles,
    // render
    icons,
    image,
    transform,
    countRender,
    actionsRender,
    // Scale
    scale,
    minScale,
    maxScale,
    // Actions
    onActive,
    onFlipY,
    onFlipX,
    onRotateLeft,
    onRotateRight,
    onZoomOut,
    onZoomIn,
    onClose,
    onReset
  } = props;
  const {
    left,
    right,
    prev,
    next,
    flipY,
    flipX,
    rotateLeft,
    rotateRight,
    zoomOut,
    zoomIn
  } = icons;

  // ========================== Render ==========================
  // >>>>> Progress
  const progressNode = showProgress && /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-progress`
  }, countRender ? countRender(current + 1, count) : /*#__PURE__*/React.createElement("bdi", null, `${current + 1} / ${count}`));

  // >>>>> Actions
  const actionCls = `${prefixCls}-actions-action`;
  const renderOperation = ({
    type,
    disabled,
    onClick,
    icon
  }) => {
    return /*#__PURE__*/React.createElement("div", {
      key: type,
      className: clsx(actionCls, `${actionCls}-${type}`, {
        [`${actionCls}-disabled`]: !!disabled
      }),
      onClick: onClick
    }, icon);
  };
  const switchPrevNode = showSwitch ? renderOperation({
    icon: prev ?? left,
    onClick: () => onActive(-1),
    type: 'prev',
    disabled: current === 0
  }) : undefined;
  const switchNextNode = showSwitch ? renderOperation({
    icon: next ?? right,
    onClick: () => onActive(1),
    type: 'next',
    disabled: current === count - 1
  }) : undefined;
  const flipYNode = renderOperation({
    icon: flipY,
    onClick: onFlipY,
    type: 'flipY'
  });
  const flipXNode = renderOperation({
    icon: flipX,
    onClick: onFlipX,
    type: 'flipX'
  });
  const rotateLeftNode = renderOperation({
    icon: rotateLeft,
    onClick: onRotateLeft,
    type: 'rotateLeft'
  });
  const rotateRightNode = renderOperation({
    icon: rotateRight,
    onClick: onRotateRight,
    type: 'rotateRight'
  });
  const zoomOutNode = renderOperation({
    icon: zoomOut,
    onClick: onZoomOut,
    type: 'zoomOut',
    disabled: scale <= minScale
  });
  const zoomInNode = renderOperation({
    icon: zoomIn,
    onClick: onZoomIn,
    type: 'zoomIn',
    disabled: scale === maxScale
  });
  const actionsNode = /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-actions`, classNames.actions),
    style: styles.actions
  }, flipYNode, flipXNode, rotateLeftNode, rotateRightNode, zoomOutNode, zoomInNode);

  // >>>>> Render
  return /*#__PURE__*/React.createElement("div", {
    className: clsx(`${prefixCls}-footer`, classNames.footer),
    style: styles.footer
  }, progressNode, actionsRender ? actionsRender(actionsNode, {
    icons: {
      prevIcon: switchPrevNode,
      nextIcon: switchNextNode,
      flipYIcon: flipYNode,
      flipXIcon: flipXNode,
      rotateLeftIcon: rotateLeftNode,
      rotateRightIcon: rotateRightNode,
      zoomOutIcon: zoomOutNode,
      zoomInIcon: zoomInNode
    },
    actions: {
      onActive,
      onFlipY,
      onFlipX,
      onRotateLeft,
      onRotateRight,
      onZoomOut,
      onZoomIn,
      onReset,
      onClose
    },
    transform,
    current,
    total: count,
    image
  }) : actionsNode);
}