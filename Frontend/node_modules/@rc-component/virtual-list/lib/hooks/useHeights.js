"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useHeights;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _CacheMap = _interopRequireDefault(require("../utils/CacheMap"));
function parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}
function useHeights(getKey, onItemAdd, onItemRemove) {
  const [updatedMark, setUpdatedMark] = React.useState(0);
  const instanceRef = (0, _react.useRef)(new Map());
  const heightsRef = (0, _react.useRef)(new _CacheMap.default());
  const promiseIdRef = (0, _react.useRef)(0);
  function cancelRaf() {
    promiseIdRef.current += 1;
  }
  function collectHeight(sync = false) {
    cancelRaf();
    const doCollect = () => {
      let changed = false;
      instanceRef.current.forEach((element, key) => {
        if (element && element.offsetParent) {
          const {
            offsetHeight
          } = element;
          const {
            marginTop,
            marginBottom
          } = getComputedStyle(element);
          const marginTopNum = parseNumber(marginTop);
          const marginBottomNum = parseNumber(marginBottom);
          const totalHeight = offsetHeight + marginTopNum + marginBottomNum;
          if (heightsRef.current.get(key) !== totalHeight) {
            heightsRef.current.set(key, totalHeight);
            changed = true;
          }
        }
      });

      // Always trigger update mark to tell parent that should re-calculate heights when resized
      if (changed) {
        setUpdatedMark(c => c + 1);
      }
    };
    if (sync) {
      doCollect();
    } else {
      promiseIdRef.current += 1;
      const id = promiseIdRef.current;
      Promise.resolve().then(() => {
        if (id === promiseIdRef.current) {
          doCollect();
        }
      });
    }
  }
  function setInstanceRef(item, instance) {
    const key = getKey(item);
    const origin = instanceRef.current.get(key);
    if (instance) {
      instanceRef.current.set(key, instance);
      collectHeight();
    } else {
      instanceRef.current.delete(key);
    }

    // Instance changed
    if (!origin !== !instance) {
      if (instance) {
        onItemAdd?.(item);
      } else {
        onItemRemove?.(item);
      }
    }
  }
  (0, _react.useEffect)(() => {
    return cancelRaf;
  }, []);
  return [setInstanceRef, collectHeight, heightsRef.current, updatedMark];
}