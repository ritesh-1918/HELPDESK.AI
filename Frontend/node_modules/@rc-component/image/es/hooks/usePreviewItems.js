import * as React from 'react';
import { COMMON_PROPS } from "../common";
/**
 * Merge props provided `items` or context collected images
 */
export default function usePreviewItems(items) {
  // Context collection image data
  const [images, setImages] = React.useState({});
  const registerImage = React.useCallback((id, data) => {
    setImages(imgs => ({
      ...imgs,
      [id]: data
    }));
    return () => {
      setImages(imgs => {
        const cloneImgs = {
          ...imgs
        };
        delete cloneImgs[id];
        return cloneImgs;
      });
    };
  }, []);

  // items
  const mergedItems = React.useMemo(() => {
    // use `items` first
    if (items) {
      return items.map(item => {
        if (typeof item === 'string') {
          return {
            data: {
              src: item
            }
          };
        }
        const data = {};
        Object.keys(item).forEach(key => {
          if (['src', ...COMMON_PROPS].includes(key)) {
            data[key] = item[key];
          }
        });
        return {
          data
        };
      });
    }

    // use registered images secondly
    return Object.keys(images).reduce((total, id) => {
      const {
        canPreview,
        data
      } = images[id];
      if (canPreview) {
        total.push({
          data,
          id
        });
      }
      return total;
    }, []);
  }, [items, images]);
  return [mergedItems, registerImage, !!items];
}