"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.animationEndName = void 0;
exports.getTransitionName = getTransitionName;
exports.getVendorPrefixedEventName = getVendorPrefixedEventName;
exports.getVendorPrefixes = getVendorPrefixes;
exports.transitionEndName = exports.supportTransition = void 0;
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// ================= Transition =================
// Event wrapper. Copy from react source code
function makePrefixMap(styleProp, eventName) {
  const prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes[`Webkit${styleProp}`] = `webkit${eventName}`;
  prefixes[`Moz${styleProp}`] = `moz${eventName}`;
  prefixes[`ms${styleProp}`] = `MS${eventName}`;
  prefixes[`O${styleProp}`] = `o${eventName.toLowerCase()}`;
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  const prefixes = {
    animationend: makePrefixMap('Animation', 'AnimationEnd'),
    transitionend: makePrefixMap('Transition', 'TransitionEnd')
  };
  if (domSupport) {
    if (!('AnimationEvent' in win)) {
      delete prefixes.animationend.animation;
    }
    if (!('TransitionEvent' in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
const vendorPrefixes = getVendorPrefixes((0, _canUseDom.default)(), typeof window !== 'undefined' ? window : {});
let style = {};
if ((0, _canUseDom.default)()) {
  ({
    style
  } = document.createElement('div'));
}
const prefixedEventNames = {};
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  const prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    const stylePropList = Object.keys(prefixMap);
    const len = stylePropList.length;
    for (let i = 0; i < len; i += 1) {
      const styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return '';
}
const internalAnimationEndName = getVendorPrefixedEventName('animationend');
const internalTransitionEndName = getVendorPrefixedEventName('transitionend');
const supportTransition = exports.supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
const animationEndName = exports.animationEndName = internalAnimationEndName || 'animationend';
const transitionEndName = exports.transitionEndName = internalTransitionEndName || 'transitionend';
function getTransitionName(transitionName, transitionType) {
  if (!transitionName) return null;
  if (typeof transitionName === 'object') {
    const type = transitionType.replace(/-\w/g, match => match[1].toUpperCase());
    return transitionName[type];
  }
  return `${transitionName}-${transitionType}`;
}