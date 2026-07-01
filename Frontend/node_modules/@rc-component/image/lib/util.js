"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClientSize = getClientSize;
exports.isImageValid = isImageValid;
function isImageValid(src) {
  return new Promise(resolve => {
    if (!src) {
      resolve(false);
      return;
    }
    const img = document.createElement('img');
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
    img.src = src;
  });
}

// ============================= Legacy =============================
function getClientSize() {
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  return {
    width,
    height
  };
}