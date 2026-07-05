import { getClientSize } from "../util";
import isEqual from "@rc-component/util/es/isEqual";
import raf from "@rc-component/util/es/raf";
import { useRef, useState } from 'react';
const initialTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  flipX: false,
  flipY: false
};
export default function useImageTransform(imgRef, minScale, maxScale, onTransform) {
  const frame = useRef(null);
  const queue = useRef([]);
  const [transform, setTransform] = useState(initialTransform);
  const resetTransform = action => {
    setTransform(initialTransform);
    if (!isEqual(initialTransform, transform)) {
      onTransform?.({
        transform: initialTransform,
        action
      });
    }
  };

  /** Direct update transform */
  const updateTransform = (newTransform, action) => {
    if (frame.current === null) {
      queue.current = [];
      frame.current = raf(() => {
        setTransform(preState => {
          let memoState = preState;
          queue.current.forEach(queueState => {
            memoState = {
              ...memoState,
              ...queueState
            };
          });
          frame.current = null;
          onTransform?.({
            transform: memoState,
            action
          });
          return memoState;
        });
      });
    }
    queue.current.push({
      ...transform,
      ...newTransform
    });
  };

  /** Scale according to the position of centerX and centerY */
  const dispatchZoomChange = (ratio, action, centerX, centerY, isTouch) => {
    const {
      width,
      height,
      offsetWidth,
      offsetHeight,
      offsetLeft,
      offsetTop
    } = imgRef.current;
    let newRatio = ratio;
    let newScale = transform.scale * ratio;
    if (newScale > maxScale) {
      newScale = maxScale;
      newRatio = maxScale / transform.scale;
    } else if (newScale < minScale) {
      // For mobile interactions, allow scaling down to the minimum scale.
      newScale = isTouch ? newScale : minScale;
      newRatio = newScale / transform.scale;
    }

    /** Default center point scaling */
    const mergedCenterX = centerX ?? innerWidth / 2;
    const mergedCenterY = centerY ?? innerHeight / 2;
    const diffRatio = newRatio - 1;
    /** Deviation calculated from image size */
    const diffImgX = diffRatio * width * 0.5;
    const diffImgY = diffRatio * height * 0.5;
    /** The difference between the click position and the edge of the document */
    const diffOffsetLeft = diffRatio * (mergedCenterX - transform.x - offsetLeft);
    const diffOffsetTop = diffRatio * (mergedCenterY - transform.y - offsetTop);
    /** Final positioning */
    let newX = transform.x - (diffOffsetLeft - diffImgX);
    let newY = transform.y - (diffOffsetTop - diffImgY);

    /**
     * When zooming the image
     * When the image size is smaller than the width and height of the window, the position is initialized
     */
    if (ratio < 1 && newScale === 1) {
      const mergedWidth = offsetWidth * newScale;
      const mergedHeight = offsetHeight * newScale;
      const {
        width: clientWidth,
        height: clientHeight
      } = getClientSize();
      if (mergedWidth <= clientWidth && mergedHeight <= clientHeight) {
        newX = 0;
        newY = 0;
      }
    }
    updateTransform({
      x: newX,
      y: newY,
      scale: newScale
    }, action);
  };
  return {
    transform,
    resetTransform,
    updateTransform,
    dispatchZoomChange
  };
}