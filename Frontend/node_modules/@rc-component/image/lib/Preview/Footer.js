"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Footer;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Footer(props) {
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
      className: (0, _clsx.clsx)(actionCls, `${actionCls}-${type}`, {
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
    className: (0, _clsx.clsx)(`${prefixCls}-actions`, classNames.actions),
    style: styles.actions
  }, flipYNode, flipXNode, rotateLeftNode, rotateRightNode, zoomOutNode, zoomInNode);

  // >>>>> Render
  return /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-footer`, classNames.footer),
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