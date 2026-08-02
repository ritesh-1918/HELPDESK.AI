"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useOrientation = void 0;
var _react = require("react");
const isValidOrientation = orientation => {
  return orientation === 'horizontal' || orientation === 'vertical';
};
const useOrientation = (orientation, vertical, legacyDirection) => {
  return (0, _react.useMemo)(() => {
    const validOrientation = isValidOrientation(orientation);
    let mergedOrientation;
    if (validOrientation) {
      mergedOrientation = orientation;
    } else if (typeof vertical === 'boolean') {
      mergedOrientation = vertical ? 'vertical' : 'horizontal';
    } else {
      const validLegacyDirection = isValidOrientation(legacyDirection);
      mergedOrientation = validLegacyDirection ? legacyDirection : 'horizontal';
    }
    return [mergedOrientation, mergedOrientation === 'vertical'];
  }, [legacyDirection, orientation, vertical]);
};
exports.useOrientation = useOrientation;