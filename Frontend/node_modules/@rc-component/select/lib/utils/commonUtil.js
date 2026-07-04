"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTitle = getTitle;
exports.hasValue = hasValue;
exports.isClient = exports.isBrowserClient = void 0;
exports.isComboNoValue = isComboNoValue;
exports.toArray = toArray;
function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return value !== undefined ? [value] : [];
}
const isClient = exports.isClient = typeof window !== 'undefined' && window.document && window.document.documentElement;

/** Is client side and not jsdom */
const isBrowserClient = exports.isBrowserClient = process.env.NODE_ENV !== 'test' && isClient;
function hasValue(value) {
  return value !== undefined && value !== null;
}

/** combo mode no value judgment function */
function isComboNoValue(value) {
  return !value && value !== 0;
}
function isTitleType(title) {
  return ['string', 'number'].includes(typeof title);
}
function getTitle(item) {
  let title = undefined;
  if (item) {
    if (isTitleType(item.title)) {
      title = item.title.toString();
    } else if (isTitleType(item.label)) {
      title = item.label.toString();
    }
  }
  return title;
}