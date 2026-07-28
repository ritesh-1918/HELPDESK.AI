"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getShadowRoot = getShadowRoot;
exports.inShadow = inShadow;
function getRoot(ele) {
  return ele?.getRootNode?.();
}

/**
 * Check if is in shadowRoot
 */
function inShadow(ele) {
  return getRoot(ele) instanceof ShadowRoot;
}

/**
 * Return shadowRoot if possible
 */
function getShadowRoot(ele) {
  return inShadow(ele) ? getRoot(ele) : null;
}