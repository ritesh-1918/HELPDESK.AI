"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFadeMotion = exports.fadeOut = exports.fadeIn = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _motion = require("./motion");
const fadeIn = exports.fadeIn = new _cssinjs.Keyframes('antFadeIn', {
  '0%': {
    opacity: 0
  },
  '100%': {
    opacity: 1
  }
});
const fadeOut = exports.fadeOut = new _cssinjs.Keyframes('antFadeOut', {
  '0%': {
    opacity: 1
  },
  '100%': {
    opacity: 0
  }
});
/**
 * Initialize fade motion styles
 *
 * Generates CSS styles for fade in/out transition animations when elements are shown/hidden.
 * Supports enter, appear, and leave animation states.
 *
 * @param token - Object containing design tokens and CSS class prefix
 * @param sameLevel - Controls CSS selector nesting behavior:
 *   - `false` (default): Generates descendant selectors like `.ant-fade-enter`, `.ant-fade-appear`
 *   - `true`: Generates same-level selectors with `&` prefix like `&.ant-fade-enter`, `&.ant-fade-appear`
 *   Use `true` when the motion classes are applied to the same element as the parent selector,
 *   Use `false` when the motion classes are applied to child elements
 * @returns CSS interpolation object containing fade motion styles
 *
 * @example
 * ```ts
 * // For child elements (default behavior)
 * const fadeStyles = initFadeMotion(token);
 * // Generates: .parent .ant-fade-enter { ... }
 *
 * // For same element
 * const sameLevelFadeStyles = initFadeMotion(token, true);
 * // Generates: .parent.ant-fade-enter { ... }
 * ```
 */
const initFadeMotion = (token, sameLevel = false) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-fade`;
  const sameLevelPrefix = sameLevel ? '&' : '';
  return [(0, _motion.initMotion)(motionCls, fadeIn, fadeOut, token.motionDurationMid, sameLevel), {
    [`
        ${sameLevelPrefix}${motionCls}-enter,
        ${sameLevelPrefix}${motionCls}-appear
      `]: {
      opacity: 0,
      animationTimingFunction: 'linear'
    },
    [`${sameLevelPrefix}${motionCls}-leave`]: {
      animationTimingFunction: 'linear'
    }
  }];
};
exports.initFadeMotion = initFadeMotion;