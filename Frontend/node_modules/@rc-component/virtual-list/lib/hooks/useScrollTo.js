"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useScrollTo;
var React = _interopRequireWildcard(require("react"));
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _util = require("@rc-component/util");
/* eslint-disable no-param-reassign */

const MAX_TIMES = 10;
function useScrollTo(containerRef, data, heights, itemHeight, getKey, collectHeight, syncScrollTop, triggerFlash) {
  const scrollRef = React.useRef();
  const [syncState, setSyncState] = React.useState(null);

  // ========================== Sync Scroll ==========================
  (0, _useLayoutEffect.default)(() => {
    if (syncState && syncState.times < MAX_TIMES) {
      // Never reach
      if (!containerRef.current) {
        setSyncState(ori => ({
          ...ori
        }));
        return;
      }
      collectHeight();
      const {
        targetAlign,
        originAlign,
        index,
        offset
      } = syncState;
      const height = containerRef.current.clientHeight;
      let needCollectHeight = false;
      let newTargetAlign = targetAlign;
      let targetTop = null;

      // Go to next frame if height not exist
      if (height) {
        const mergedAlign = targetAlign || originAlign;

        // Get top & bottom
        let stackTop = 0;
        let itemTop = 0;
        let itemBottom = 0;
        const maxLen = Math.min(data.length - 1, index);
        for (let i = 0; i <= maxLen; i += 1) {
          const key = getKey(data[i]);
          itemTop = stackTop;
          const cacheHeight = heights.get(key);
          itemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);
          stackTop = itemBottom;
        }

        // Check if need sync height (visible range has item not record height)
        let leftHeight = mergedAlign === 'top' ? offset : height - offset;
        for (let i = maxLen; i >= 0; i -= 1) {
          const key = getKey(data[i]);
          const cacheHeight = heights.get(key);
          if (cacheHeight === undefined) {
            needCollectHeight = true;
            break;
          }
          leftHeight -= cacheHeight;
          if (leftHeight <= 0) {
            break;
          }
        }

        // Scroll to
        switch (mergedAlign) {
          case 'top':
            targetTop = itemTop - offset;
            break;
          case 'bottom':
            targetTop = itemBottom - height + offset;
            break;
          default:
            {
              const {
                scrollTop
              } = containerRef.current;
              const scrollBottom = scrollTop + height;
              if (itemTop < scrollTop) {
                newTargetAlign = 'top';
              } else if (itemBottom > scrollBottom) {
                newTargetAlign = 'bottom';
              }
            }
        }
        if (targetTop !== null) {
          syncScrollTop(targetTop);
        }

        // One more time for sync
        if (targetTop !== syncState.lastTop) {
          needCollectHeight = true;
        }
      }

      // Trigger next effect
      if (needCollectHeight) {
        setSyncState({
          ...syncState,
          times: syncState.times + 1,
          targetAlign: newTargetAlign,
          lastTop: targetTop
        });
      }
    } else if (process.env.NODE_ENV !== 'production' && syncState?.times === MAX_TIMES) {
      (0, _util.warning)(false, 'Seems `scrollTo` with `rc-virtual-list` reach the max limitation. Please fire issue for us. Thanks.');
    }
  }, [syncState, containerRef.current]);

  // =========================== Scroll To ===========================
  return arg => {
    // When not argument provided, we think dev may want to show the scrollbar
    if (arg === null || arg === undefined) {
      triggerFlash();
      return;
    }

    // Normal scroll logic
    _raf.default.cancel(scrollRef.current);
    if (typeof arg === 'number') {
      syncScrollTop(arg);
    } else if (arg && typeof arg === 'object') {
      let index;
      const {
        align
      } = arg;
      if ('index' in arg) {
        ({
          index
        } = arg);
      } else {
        index = data.findIndex(item => getKey(item) === arg.key);
      }
      const {
        offset = 0
      } = arg;
      setSyncState({
        times: 0,
        index,
        offset,
        originAlign: align
      });
    }
  };
}