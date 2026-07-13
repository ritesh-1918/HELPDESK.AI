"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = usePreviewItems;
var React = _interopRequireWildcard(require("react"));
var _common = require("../common");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Merge props provided `items` or context collected images
 */
function usePreviewItems(items) {
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
          if (['src', ..._common.COMMON_PROPS].includes(key)) {
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