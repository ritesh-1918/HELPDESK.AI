"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FontGap = exports.BaseSize = void 0;
exports.default = useWatermark;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _utils = require("./utils");
/**
 * Base size of the canvas, 1 for parallel layout and 2 for alternate layout
 * Only alternate layout is currently supported
 */
const BaseSize = exports.BaseSize = 2;
const FontGap = exports.FontGap = 3;
// Prevent external hidden elements from adding accent styles
const emphasizedStyle = {
  visibility: 'visible !important'
};
function useWatermark(markStyle, onRemove) {
  const watermarkMap = React.useRef(new Map());
  const onRemoveEvent = (0, _util.useEvent)(onRemove);
  const appendWatermark = (base64Url, markWidth, container) => {
    if (container) {
      const exist = watermarkMap.current.get(container);
      if (!exist) {
        const newWatermarkEle = document.createElement('div');
        watermarkMap.current.set(container, newWatermarkEle);
      }
      const watermarkEle = watermarkMap.current.get(container);
      watermarkEle.setAttribute('style', (0, _utils.getStyleStr)({
        ...markStyle,
        backgroundImage: `url('${base64Url}')`,
        backgroundSize: `${Math.floor(markWidth)}px`,
        ...emphasizedStyle
      }));
      // Prevents using the browser `Hide Element` to hide watermarks
      watermarkEle.removeAttribute('class');
      watermarkEle.removeAttribute('hidden');
      if (watermarkEle.parentElement !== container) {
        if (exist && onRemove) {
          onRemoveEvent();
        }
        container.append(watermarkEle);
      }
    }
    return watermarkMap.current.get(container);
  };
  const removeWatermark = container => {
    const watermarkEle = watermarkMap.current.get(container);
    if (watermarkEle && container) {
      container.removeChild(watermarkEle);
    }
    watermarkMap.current.delete(container);
  };
  const isWatermarkEle = ele => Array.from(watermarkMap.current.values()).includes(ele);
  return [appendWatermark, removeWatermark, isWatermarkEle];
}