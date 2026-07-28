import * as React from 'react';
import { useEvent } from '@rc-component/util';
import { getStyleStr } from './utils';
/**
 * Base size of the canvas, 1 for parallel layout and 2 for alternate layout
 * Only alternate layout is currently supported
 */
export const BaseSize = 2;
export const FontGap = 3;
// Prevent external hidden elements from adding accent styles
const emphasizedStyle = {
  visibility: 'visible !important'
};
export default function useWatermark(markStyle, onRemove) {
  const watermarkMap = React.useRef(new Map());
  const onRemoveEvent = useEvent(onRemove);
  const appendWatermark = (base64Url, markWidth, container) => {
    if (container) {
      const exist = watermarkMap.current.get(container);
      if (!exist) {
        const newWatermarkEle = document.createElement('div');
        watermarkMap.current.set(container, newWatermarkEle);
      }
      const watermarkEle = watermarkMap.current.get(container);
      watermarkEle.setAttribute('style', getStyleStr({
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