"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = set;
exports.merge = merge;
exports.mergeWith = mergeWith;
var _get = _interopRequireDefault(require("./get"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function internalSet(entity, paths, value, removeIfUndefined) {
  if (!paths.length) {
    return value;
  }
  const [path, ...restPath] = paths;
  let clone;
  if (!entity && typeof path === 'number') {
    clone = [];
  } else if (Array.isArray(entity)) {
    clone = [...entity];
  } else {
    clone = {
      ...entity
    };
  }

  // Delete prop if `removeIfUndefined` and value is undefined
  if (removeIfUndefined && value === undefined && restPath.length === 1) {
    delete clone[path][restPath[0]];
  } else {
    clone[path] = internalSet(clone[path], restPath, value, removeIfUndefined);
  }
  return clone;
}
function set(entity, paths, value, removeIfUndefined = false) {
  // Do nothing if `removeIfUndefined` and parent object not exist
  if (paths.length && removeIfUndefined && value === undefined && !(0, _get.default)(entity, paths.slice(0, -1))) {
    return entity;
  }
  return internalSet(entity, paths, value, removeIfUndefined);
}
function isObject(obj) {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
}
function createEmpty(source) {
  return Array.isArray(source) ? [] : {};
}
const keys = typeof Reflect === 'undefined' ? Object.keys : Reflect.ownKeys;

// ================================ Merge ================================

/**
 * Merge multiple objects. Support custom merge logic.
 * @param sources object sources
 * @param config.prepareArray Customize array prepare function.
 * It will return empty [] by default.
 * So when match array, it will auto be override with next array in sources.
 */
function mergeWith(sources, config = {}) {
  const {
    prepareArray
  } = config;
  const finalPrepareArray = prepareArray || (() => []);
  let clone = createEmpty(sources[0]);
  sources.forEach(src => {
    function internalMerge(path, parentLoopSet) {
      const loopSet = new Set(parentLoopSet);
      const value = (0, _get.default)(src, path);
      const isArr = Array.isArray(value);
      if (isArr || isObject(value)) {
        // Only add not loop obj
        if (!loopSet.has(value)) {
          loopSet.add(value);
          const originValue = (0, _get.default)(clone, path);
          if (isArr) {
            // Array will always be override
            clone = set(clone, path, finalPrepareArray(originValue, value));
          } else if (!originValue || typeof originValue !== 'object') {
            // Init container if not exist
            clone = set(clone, path, createEmpty(value));
          }
          keys(value).forEach(key => {
            if (Object.getOwnPropertyDescriptor(value, key).enumerable) {
              internalMerge([...path, key], loopSet);
            }
          });
        }
      } else {
        clone = set(clone, path, value);
      }
    }
    internalMerge([]);
  });
  return clone;
}

/**
 * Merge multiple objects into a new single object.
 * Arrays will be replaced by default.
 */
function merge(...sources) {
  return mergeWith(sources);
}