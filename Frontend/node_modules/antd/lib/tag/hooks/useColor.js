"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useColor;
var React = _interopRequireWildcard(require("react"));
var _fastColor = require("@ant-design/fast-color");
var _colors = require("../../_util/colors");
/**
 * Convert color related props to a unified object,
 * which is used to flatten the compatibility requirements.
 */
function useColor(props, contextVariant) {
  const {
    color,
    variant,
    bordered
  } = props;
  return React.useMemo(() => {
    const isInverseColor = color?.endsWith('-inverse');
    // =================== Variant ===================
    let nextVariant;
    if (variant) {
      // `variant` first
      nextVariant = variant;
    } else if (isInverseColor) {
      // Fallback if using inverse color
      nextVariant = 'solid';
    } else if (bordered === false) {
      // Fallback if using filled
      nextVariant = 'filled';
    } else {
      // Finally not conflict, use context
      nextVariant = contextVariant || 'filled';
    }
    // ==================== Color ====================
    const nextColor = isInverseColor ? color?.replace('-inverse', '') : color;
    // =============== Preset & Status ===============
    const nextIsPreset = (0, _colors.isPresetColor)(color);
    const nextIsStatus = (0, _colors.isPresetStatusColor)(color);
    // ================== Customize ==================
    // When `color` is not preset color,
    // dynamic calculate the color pair.
    const tagStyle = {};
    if (!nextIsPreset && !nextIsStatus && nextColor) {
      if (nextVariant === 'solid') {
        tagStyle.backgroundColor = color;
      } else {
        const hsl = new _fastColor.FastColor(nextColor).toHsl();
        hsl.l = 0.95;
        tagStyle.backgroundColor = new _fastColor.FastColor(hsl).toHexString();
        tagStyle.color = color;
        if (nextVariant === 'outlined') {
          tagStyle.borderColor = color;
        }
      }
    }
    return [nextVariant, nextColor, nextIsPreset, nextIsStatus, tagStyle];
  }, [color, variant, bordered, contextVariant]);
}