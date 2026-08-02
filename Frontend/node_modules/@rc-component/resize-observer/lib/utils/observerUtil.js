"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._rs = exports._el = void 0;
exports.observe = observe;
exports.unobserve = unobserve;
// =============================== Const ===============================
const elementListeners = new Map();
function onResize(entities) {
  entities.forEach(entity => {
    const {
      target
    } = entity;
    elementListeners.get(target)?.forEach(listener => listener(target));
  });
}

// Delay create ResizeObserver since it's not supported in server side
let observer;
function ensureResizeObserver() {
  if (!observer) {
    observer = new ResizeObserver(onResize);
  }
  return observer;
}

// Dev env only
const _el = exports._el = process.env.NODE_ENV !== 'production' ? elementListeners : null; // eslint-disable-line
const _rs = exports._rs = process.env.NODE_ENV !== 'production' ? onResize : null; // eslint-disable-line

// ============================== Observe ==============================
function observe(element, callback) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, new Set());
    ensureResizeObserver().observe(element);
  }
  elementListeners.get(element).add(callback);
}
function unobserve(element, callback) {
  if (elementListeners.has(element)) {
    elementListeners.get(element).delete(callback);
    if (!elementListeners.get(element).size) {
      ensureResizeObserver().unobserve(element);
      elementListeners.delete(element);
    }
  }
}