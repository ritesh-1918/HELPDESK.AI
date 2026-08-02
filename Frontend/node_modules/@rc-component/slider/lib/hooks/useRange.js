"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRange;
var _warning = require("@rc-component/util/lib/warning");
var _react = require("react");
function useRange(range) {
  return (0, _react.useMemo)(() => {
    if (range === true || !range) {
      return [!!range, false, false, 0];
    }
    const {
      editable,
      draggableTrack,
      minCount,
      maxCount
    } = range;
    if (process.env.NODE_ENV !== 'production') {
      (0, _warning.warning)(!editable || !draggableTrack, '`editable` can not work with `draggableTrack`.');
    }
    return [true, editable, !editable && draggableTrack, minCount || 0, maxCount];
  }, [range]);
}