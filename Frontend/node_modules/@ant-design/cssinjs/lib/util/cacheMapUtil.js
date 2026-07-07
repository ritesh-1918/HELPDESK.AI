"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSS_FILE_STYLE = exports.ATTR_CACHE_MAP = void 0;
exports.existPath = existPath;
exports.getStyleAndHash = getStyleAndHash;
exports.prepare = prepare;
exports.reset = reset;
exports.serialize = serialize;
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
var _StyleContext = require("../StyleContext");
const ATTR_CACHE_MAP = exports.ATTR_CACHE_MAP = 'data-ant-cssinjs-cache-path';

/**
 * This marks style from the css file.
 * Which means not exist in `<style />` tag.
 */
const CSS_FILE_STYLE = exports.CSS_FILE_STYLE = '_FILE_STYLE__';
function serialize(cachePathMap) {
  return Object.keys(cachePathMap).map(path => {
    const hash = cachePathMap[path];
    return `${path}:${hash}`;
  }).join(';');
}
let cachePathMap;
let fromCSSFile = true;

/**
 * @private Test usage only. Can save remove if no need.
 */
function reset(mockCache, fromFile = true) {
  cachePathMap = mockCache;
  fromCSSFile = fromFile;
}
function prepare() {
  if (!cachePathMap) {
    cachePathMap = {};
    if ((0, _canUseDom.default)()) {
      const div = document.createElement('div');
      div.className = ATTR_CACHE_MAP;
      div.style.position = 'fixed';
      div.style.visibility = 'hidden';
      div.style.top = '-9999px';
      document.body.appendChild(div);
      let content = getComputedStyle(div).content || '';
      content = content.replace(/^"/, '').replace(/"$/, '');

      // Fill data
      content.split(';').forEach(item => {
        const [path, hash] = item.split(':');
        cachePathMap[path] = hash;
      });

      // Remove inline record style
      const inlineMapStyle = document.querySelector(`style[${ATTR_CACHE_MAP}]`);
      if (inlineMapStyle) {
        fromCSSFile = false;
        inlineMapStyle.parentNode?.removeChild(inlineMapStyle);
      }
      document.body.removeChild(div);
    }
  }
}
function existPath(path) {
  prepare();
  return !!cachePathMap[path];
}
function getStyleAndHash(path) {
  const hash = cachePathMap[path];
  let styleStr = null;
  if (hash && (0, _canUseDom.default)()) {
    if (fromCSSFile) {
      styleStr = CSS_FILE_STYLE;
    } else {
      const style = document.querySelector(`style[${_StyleContext.ATTR_MARK}="${cachePathMap[path]}"]`);
      if (style) {
        styleStr = style.innerHTML;
      } else {
        // Clean up since not exist anymore
        delete cachePathMap[path];
      }
    }
  }
  return [styleStr, hash];
}