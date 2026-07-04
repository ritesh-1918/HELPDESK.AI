"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = usePositions;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var React = _interopRequireWildcard(require("react"));
// Disabled the rule since `fill` is safe here
// but `Array.from` will increase bundle size.
/* eslint-disable unicorn/no-new-array */

/**
 * Auto arrange the items in the masonry layout.
 * Always get stable positions by order
 * instead of dynamic adjust for next item height.
 */
function usePositions(itemHeights, columnCount, verticalGutter) {
  // ==================== Auto Order ====================
  const [orderItemPositions, orderTotalHeight] = React.useMemo(() => {
    const columnHeights = new Array(columnCount).fill(0);
    const itemPositions = new Map();
    for (let i = 0; i < itemHeights.length; i += 1) {
      const [itemKey, itemHeight, itemColumn] = itemHeights[i];
      let targetColumnIndex = itemColumn ?? columnHeights.indexOf(Math.min.apply(Math, (0, _toConsumableArray2.default)(columnHeights)));
      targetColumnIndex = Math.min(targetColumnIndex, columnCount - 1);
      const top = columnHeights[targetColumnIndex];
      itemPositions.set(itemKey, {
        column: targetColumnIndex,
        top
      });
      columnHeights[targetColumnIndex] += itemHeight + verticalGutter;
    }
    return [itemPositions, Math.max(0, Math.max.apply(Math, (0, _toConsumableArray2.default)(columnHeights)) - verticalGutter)];
  }, [columnCount, itemHeights, verticalGutter]);
  // ====================== Return ======================
  return [orderItemPositions, orderTotalHeight];
}